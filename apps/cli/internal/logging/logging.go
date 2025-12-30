// Package logging provides structured file-based logging for the godeploy CLI.
// Logs are written to files only - stdout/stderr are reserved for CLI UX.
//
// Log files are stored in the XDG state directory:
//
//	~/.local/state/godeploy/logs/godeploy-YYYY-MM-DD.log
//
// Features:
//   - JSON structured logging with zerolog
//   - Date-based log files
//   - Automatic log rotation (5MB max per file)
//   - Keeps last 3 log files
//   - Log level controlled by GODEPLOY_LOG_LEVEL env var
//
// Log levels (GODEPLOY_LOG_LEVEL):
//
//	trace, debug, info (default), warn, error, fatal, disabled/off
package logging

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"github.com/silvabyte/godeploy/internal/paths"
	"github.com/silvabyte/godeploy/internal/version"
)

const (
	// MaxLogSize is the maximum size of a single log file (5MB)
	MaxLogSize = 5 * 1024 * 1024
	// MaxLogFiles is the maximum number of log files to keep
	MaxLogFiles = 3
	// LogFilePrefix is the prefix for log files
	LogFilePrefix = "godeploy-"
	// LogFileSuffix is the suffix for log files
	LogFileSuffix = ".log"
)

var (
	// Logger is the global file logger instance
	Logger zerolog.Logger
	// logFile is the current log file handle
	logFile *os.File
	// initialized tracks whether Init has been called
	initialized bool
)

// Init initializes the file logger with date-based log files and rotation.
// Should be called once at CLI startup. Safe to call multiple times.
// If initialization fails, logging will be silently disabled (noop logger).
func Init() error {
	if initialized {
		return nil
	}

	// Determine log level from environment
	level := getLogLevel()

	// If logging is disabled, use noop logger
	if level == zerolog.Disabled {
		Logger = zerolog.Nop()
		initialized = true
		return nil
	}

	// Get today's log file path
	logPath, err := getLogFilePath()
	if err != nil {
		Logger = zerolog.Nop()
		return fmt.Errorf("failed to get log file path: %w", err)
	}

	// Rotate logs if needed
	if err := rotateLogsIfNeeded(logPath); err != nil {
		// Non-fatal: log rotation failure shouldn't prevent logging
		// Can't log this yet since logger isn't initialized
	}

	// Clean up old log files
	if err := cleanupOldLogs(); err != nil {
		// Non-fatal: cleanup failure shouldn't prevent logging
	}

	// Open log file (append mode)
	logFile, err = os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		Logger = zerolog.Nop()
		return fmt.Errorf("failed to open log file: %w", err)
	}

	// Configure zerolog
	zerolog.TimeFieldFormat = time.RFC3339

	// Create logger that writes JSON to file
	Logger = zerolog.New(logFile).
		Level(level).
		With().
		Timestamp().
		Caller().
		Logger()

	initialized = true

	// Log startup
	ver, _ := version.GetVersion()
	Logger.Info().
		Str("version", ver).
		Str("log_path", logPath).
		Str("log_level", level.String()).
		Msg("CLI started")

	return nil
}

// Close closes the log file. Should be called with defer in main.
func Close() {
	if logFile != nil {
		Logger.Info().Msg("CLI shutdown")
		if err := logFile.Sync(); err != nil {
			// Ignore sync errors on close
		}
		_ = logFile.Close()
		logFile = nil
	}
	initialized = false
}

// getLogLevel returns the log level from GODEPLOY_LOG_LEVEL env var
func getLogLevel() zerolog.Level {
	levelStr := os.Getenv("GODEPLOY_LOG_LEVEL")
	switch strings.ToLower(levelStr) {
	case "trace":
		return zerolog.TraceLevel
	case "debug":
		return zerolog.DebugLevel
	case "info":
		return zerolog.InfoLevel
	case "warn", "warning":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	case "fatal":
		return zerolog.FatalLevel
	case "disabled", "off":
		return zerolog.Disabled
	default:
		// Default to info level
		return zerolog.InfoLevel
	}
}

// getLogFilePath returns today's log file path
func getLogFilePath() (string, error) {
	today := time.Now().Format("2006-01-02")
	filename := fmt.Sprintf("%s%s%s", LogFilePrefix, today, LogFileSuffix)
	return paths.LogFile(filename)
}

// rotateLogsIfNeeded rotates the current log file if it exceeds MaxLogSize
func rotateLogsIfNeeded(logPath string) error {
	info, err := os.Stat(logPath)
	if os.IsNotExist(err) {
		return nil // File doesn't exist yet, no rotation needed
	}
	if err != nil {
		return err
	}

	if info.Size() < MaxLogSize {
		return nil // File is under size limit
	}

	// Rotate: rename current file with timestamp suffix
	rotatedPath := fmt.Sprintf("%s.%d", logPath, time.Now().Unix())
	return os.Rename(logPath, rotatedPath)
}

// cleanupOldLogs removes old log files, keeping only MaxLogFiles most recent
func cleanupOldLogs() error {
	logDir := paths.GetLogDir()
	entries, err := os.ReadDir(logDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	// Collect log files
	var logFiles []os.DirEntry
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasPrefix(entry.Name(), LogFilePrefix) {
			logFiles = append(logFiles, entry)
		}
	}

	// If we have fewer than MaxLogFiles, nothing to clean
	if len(logFiles) <= MaxLogFiles {
		return nil
	}

	// Sort by modification time (newest first)
	sort.Slice(logFiles, func(i, j int) bool {
		infoI, _ := logFiles[i].Info()
		infoJ, _ := logFiles[j].Info()
		if infoI == nil || infoJ == nil {
			return false
		}
		return infoI.ModTime().After(infoJ.ModTime())
	})

	// Delete oldest files beyond MaxLogFiles
	for i := MaxLogFiles; i < len(logFiles); i++ {
		path := filepath.Join(logDir, logFiles[i].Name())
		_ = os.Remove(path) // Ignore errors for cleanup
	}

	return nil
}

// GetLogPath returns the current log file path (useful for debugging)
func GetLogPath() (string, error) {
	return getLogFilePath()
}

// IsInitialized returns whether the logger has been initialized
func IsInitialized() bool {
	return initialized
}

// Convenience functions for logging

// Debug returns a debug level event
func Debug() *zerolog.Event {
	return Logger.Debug()
}

// Info returns an info level event
func Info() *zerolog.Event {
	return Logger.Info()
}

// Warn returns a warn level event
func Warn() *zerolog.Event {
	return Logger.Warn()
}

// Error returns an error level event
func Error() *zerolog.Event {
	return Logger.Error()
}

// Fatal returns a fatal level event (note: this will NOT call os.Exit)
func Fatal() *zerolog.Event {
	return Logger.Fatal()
}

// Trace returns a trace level event
func Trace() *zerolog.Event {
	return Logger.Trace()
}

// Err logs an error with a message (convenience wrapper)
func Err(err error, msg string) {
	Logger.Error().Err(err).Msg(msg)
}

// WithField returns a new logger with a field added
func WithField(key, value string) zerolog.Logger {
	return Logger.With().Str(key, value).Logger()
}

// WithFields returns a new logger with multiple fields added
func WithFields(fields map[string]string) zerolog.Logger {
	ctx := Logger.With()
	for k, v := range fields {
		ctx = ctx.Str(k, v)
	}
	return ctx.Logger()
}
