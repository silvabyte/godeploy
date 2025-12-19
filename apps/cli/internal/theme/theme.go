// Package theme provides consistent styling for the GoDeploy CLI using lipgloss.
// It defines a cohesive color palette aligned with the GoDeploy web UI brand.
package theme

import "github.com/charmbracelet/lipgloss"

// =============================================================================
// Color Palette - Aligned with GoDeploy Web UI (Tailwind colors)
// =============================================================================

// Brand colors - GoDeploy's primary visual identity
// Based on Tailwind green palette used in dashboard/marketing apps
var (
	// Primary brand color - Tailwind green-500
	Primary = lipgloss.Color("#22C55E")
	// PrimaryLight - Tailwind green-400
	PrimaryLight = lipgloss.Color("#4ADE80")
	// PrimaryDark - Tailwind green-600 (hover state)
	PrimaryDark = lipgloss.Color("#16A34A")
	// PrimaryDarker - Tailwind green-700 (active state)
	PrimaryDarker = lipgloss.Color("#15803D")

	// Accent color - Tailwind slate-900 (secondary button color)
	Accent = lipgloss.Color("#0F172A")
)

// Semantic colors - convey meaning
// Aligned with Tailwind colors used in the UI
var (
	// Success - Tailwind emerald-500 (used for status indicators)
	Success = lipgloss.Color("#10B981")
	// SuccessLight - Tailwind emerald-400
	SuccessLight = lipgloss.Color("#34D399")

	// Error - Tailwind rose-500 (used for failed status)
	Error = lipgloss.Color("#F43F5E")
	// ErrorLight - Tailwind rose-400
	ErrorLight = lipgloss.Color("#FB7185")

	// Warning - Tailwind yellow-400 (used for pending status)
	Warning = lipgloss.Color("#FACC15")
	// WarningLight - Tailwind yellow-300
	WarningLight = lipgloss.Color("#FDE047")

	// Info - Tailwind blue-500 (used for preview badge)
	Info = lipgloss.Color("#3B82F6")
	// InfoLight - Tailwind blue-400
	InfoLight = lipgloss.Color("#60A5FA")
)

// Neutral colors - Tailwind slate palette
var (
	// Text - Tailwind slate-900 (primary text)
	TextDark = lipgloss.Color("#0F172A")
	// Text - white for dark backgrounds
	Text = lipgloss.Color("#FFFFFF")
	// TextMuted - Tailwind slate-500
	TextMuted = lipgloss.Color("#64748B")
	// TextDim - Tailwind slate-400
	TextDim = lipgloss.Color("#94A3B8")

	// Background - dark background for terminal
	Background = lipgloss.Color("#0F172A")
	// BackgroundLight - Tailwind slate-100
	BackgroundLight = lipgloss.Color("#F1F5F9")

	// Border - Tailwind slate-200
	Border = lipgloss.Color("#E2E8F0")
	// BorderDark - darker border for terminal
	BorderDark = lipgloss.Color("#334155")
)

// =============================================================================
// Base Styles
// =============================================================================

// Title styles for section headers
var (
	// TitleStyle - primary title style with brand green
	TitleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(Primary).
			Padding(0, 1)

	// TitleSuccessStyle - title for success states (brand green background)
	TitleSuccessStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(Text).
				Background(Primary).
				Padding(0, 1)

	// TitleErrorStyle - title for error states
	TitleErrorStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(Text).
			Background(Error).
			Padding(0, 1)

	// TitleWarningStyle - title for warning states
	TitleWarningStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(Background).
				Background(Warning).
				Padding(0, 1)

	// TitleInfoStyle - title for info states
	TitleInfoStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(Text).
			Background(Info).
			Padding(0, 1)
)

// Key-Value pair styles for displaying labeled data
var (
	// KeyStyle - style for labels/keys in key-value pairs (muted slate)
	KeyStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(TextMuted).
			Width(16).
			Align(lipgloss.Right)

	// KeySuccessStyle - key style for success contexts (brand green)
	KeySuccessStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(Primary).
			Width(14).
			Align(lipgloss.Right)

	// KeyErrorStyle - key style for error contexts
	KeyErrorStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ErrorLight).
			Width(14).
			Align(lipgloss.Right)

	// ValueStyle - style for values in key-value pairs
	ValueStyle = lipgloss.NewStyle().
			Foreground(Text)

	// ValueMutedStyle - muted value style
	ValueMutedStyle = lipgloss.NewStyle().
			Foreground(TextMuted)

	// ValueErrorStyle - error value style (italic, rose-300)
	ValueErrorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FDA4AF")).
			Italic(true)
)

// URL and link styles
var (
	// URLStyle - style for clickable URLs
	URLStyle = lipgloss.NewStyle().
		Bold(true).
		Foreground(Info).
		Underline(true)
)

// Border and container styles
var (
	// BoxStyle - standard bordered box (slate border for terminal)
	BoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(BorderDark).
			Padding(1, 2)

	// BoxSuccessStyle - success-themed bordered box (brand green)
	BoxSuccessStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(Primary).
			Padding(1, 2)

	// BoxErrorStyle - error-themed bordered box
	BoxErrorStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(Error).
			Padding(1, 2)

	// BoxWarningStyle - warning-themed bordered box
	BoxWarningStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(Warning).
			Padding(1, 2)

	// BoxInfoStyle - info-themed bordered box
	BoxInfoStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(Info).
			Padding(1, 2)
)

// =============================================================================
// Helper Functions
// =============================================================================

// KeyValue renders a key-value pair with consistent styling
func KeyValue(key, value string) string {
	return lipgloss.JoinHorizontal(lipgloss.Left,
		KeyStyle.Render(key+":"),
		" ",
		ValueStyle.Render(value),
	)
}

// KeyValueSuccess renders a key-value pair with success styling
func KeyValueSuccess(key, value string) string {
	return lipgloss.JoinHorizontal(lipgloss.Left,
		KeySuccessStyle.Render(key+":"),
		" ",
		ValueStyle.Render(value),
	)
}

// KeyValueError renders a key-value pair with error styling
func KeyValueError(key, value string) string {
	return lipgloss.JoinHorizontal(lipgloss.Left,
		KeyErrorStyle.Render(key+":"),
		" ",
		ValueErrorStyle.Render(value),
	)
}

// KeyValueURL renders a key-value pair where the value is a URL
func KeyValueURL(key, url string) string {
	return lipgloss.JoinHorizontal(lipgloss.Left,
		KeySuccessStyle.Render(key+":"),
		" ",
		URLStyle.Render(url),
	)
}

// =============================================================================
// Message Helpers
// =============================================================================

// SuccessIcon is the icon used for success messages
const SuccessIcon = "✓"

// ErrorIcon is the icon used for error messages
const ErrorIcon = "✗"

// WarningIcon is the icon used for warning messages
const WarningIcon = "!"

// InfoIcon is the icon used for info messages
const InfoIcon = "i"

var (
	// successPrefix style - using brand green for consistency
	successPrefixStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(Primary)

	// errorPrefix style
	errorPrefixStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(Error)

	// warningPrefix style
	warningPrefixStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(Warning)

	// infoPrefix style
	infoPrefixStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(Info)

	// messageStyle for the actual message text
	messageStyle = lipgloss.NewStyle().
			Foreground(Text)

	// mutedMessageStyle for less prominent messages
	mutedMessageStyle = lipgloss.NewStyle().
				Foreground(TextMuted)
)

// SuccessMsg formats a success message with icon (using brand green)
func SuccessMsg(msg string) string {
	return successPrefixStyle.Render(SuccessIcon) + " " + messageStyle.Render(msg)
}

// ErrorMsg formats an error message with icon
func ErrorMsg(msg string) string {
	return errorPrefixStyle.Render(ErrorIcon) + " " + messageStyle.Render(msg)
}

// WarningMsg formats a warning message with icon
func WarningMsg(msg string) string {
	return warningPrefixStyle.Render(WarningIcon) + " " + messageStyle.Render(msg)
}

// InfoMsg formats an info message with icon
func InfoMsg(msg string) string {
	return infoPrefixStyle.Render(InfoIcon) + " " + messageStyle.Render(msg)
}

// MutedMsg formats a muted/secondary message
func MutedMsg(msg string) string {
	return mutedMessageStyle.Render(msg)
}

// Bold renders text in bold
func Bold(msg string) string {
	return lipgloss.NewStyle().Bold(true).Render(msg)
}

// Highlight renders text with the primary brand color
func Highlight(msg string) string {
	return lipgloss.NewStyle().Foreground(Primary).Render(msg)
}

// =============================================================================
// Compression Ratio Helper
// =============================================================================

// CompressionRatioColor returns an appropriate color based on compression ratio
// Lower ratios are better (more compression achieved)
func CompressionRatioColor(ratio float64) lipgloss.Color {
	if ratio < 60 {
		return PrimaryLight // Brand green - excellent compression
	}
	if ratio < 80 {
		return Warning // Yellow - okay compression
	}
	return ErrorLight // Red - poor compression
}

// CompressionRatioStyle returns a style for the compression ratio value
func CompressionRatioStyle(ratio float64) lipgloss.Style {
	return lipgloss.NewStyle().
		Bold(true).
		Foreground(CompressionRatioColor(ratio))
}

// =============================================================================
// Stub/Not Implemented Helper
// =============================================================================

// NotImplementedIcon is shown for stub commands
const NotImplementedIcon = "..."

var (
	notImplementedStyle = lipgloss.NewStyle().
				Foreground(TextMuted)

	commandStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(Primary)
)

// NotImplementedMsg formats a "not implemented" message for stub commands
func NotImplementedMsg(command string) string {
	return notImplementedStyle.Render(NotImplementedIcon+" ") +
		commandStyle.Render(command) +
		notImplementedStyle.Render(" is not yet implemented")
}

// NotImplementedWithDesc formats a "not implemented" message with description
func NotImplementedWithDesc(command, description string) string {
	return NotImplementedMsg(command) + "\n" + MutedMsg(description)
}
