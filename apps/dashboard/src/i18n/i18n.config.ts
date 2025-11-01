import { load } from "@matsilva/xtranslate";
import enTranslations from "./locales/en.json?url";

const translations = {
	//need to do this for every language, otherwise the translations will not be loaded
	en: enTranslations.replace(".en.", ".{{lng}}."),
};

const locale = new Intl.Locale(navigator.language);
const language = locale.language;

/**
 * Initializes the internationalization (i18n) configuration
 * Loads translation files from the specified path
 */
export async function initializeI18n() {
	const whichLanguage =
		translations[language as keyof typeof translations] ?? translations.en;
	try {
		await load({
			loadPath: whichLanguage,
			crossDomain: false,
		});
		return true;
	} catch (_error) {
		return false;
	}
}
