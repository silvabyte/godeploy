import { load } from '@matsilva/xtranslate';

/**
 * Initializes the internationalization (i18n) configuration
 * Loads translation files from the specified path
 */
export async function initializeI18n() {
  try {
    await load({
      loadPath: '/locales/{{lng}}.json',
      crossDomain: false,
    });
    return true;
  } catch (error) {
    // i18next will fallback to 'en' on an error
    console.log('Error loading translations:', error);
    return false;
  }
}
