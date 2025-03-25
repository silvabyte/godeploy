package nginx

import (
	"fmt"
	"os"
	"regexp"
)

// FixBaseHref updates or adds the base href in an HTML file.
func FixBaseHref(htmlFilePath, baseHrefValue string) error {
	content, err := os.ReadFile(htmlFilePath)
	if err != nil {
		return fmt.Errorf("failed to read %s: %w", htmlFilePath, err)
	}

	contentStr := string(content)
	baseHrefRegex := regexp.MustCompile(`<base href="[^"]*"`)

	if baseHrefRegex.MatchString(contentStr) {
		contentStr = baseHrefRegex.ReplaceAllString(contentStr, fmt.Sprintf(`<base href="%s"`, baseHrefValue))
	} else {
		headRegex := regexp.MustCompile(`(?i)<head[^>]*>`)
		if headRegex.MatchString(contentStr) {
			contentStr = headRegex.ReplaceAllString(contentStr, fmt.Sprintf("$0\n    <base href=\"%s\" />", baseHrefValue))
		} else {
			return fmt.Errorf("no <head> tag found in %s", htmlFilePath)
		}
	}

	if err := os.WriteFile(htmlFilePath, []byte(contentStr), 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", htmlFilePath, err)
	}

	return nil
}
