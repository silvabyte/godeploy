package main

import (
	"fmt"
	"os"

	"github.com/silvabyte/godeploy/internal/logging"
)

func main() {
	// Initialize file logger (silent failure OK - don't break CLI if logging fails)
	// Only show warning if user explicitly set GODEPLOY_LOG_LEVEL
	if err := logging.Init(); err != nil {
		if os.Getenv("GODEPLOY_LOG_LEVEL") != "" {
			fmt.Fprintf(os.Stderr, "Warning: failed to initialize logging: %v\n", err)
		}
	}
	defer logging.Close()

	if err := RunCLI(); err != nil {
		logging.Err(err, "CLI error")
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
