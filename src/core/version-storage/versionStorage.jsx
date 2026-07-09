import { supportedLanguages } from "../variables/ProjectVariables";

export const VERSION_STORAGE_KEY = "app_bundles_version";

const HOME_COUNTRIES_CACHE_BASE_KEY = "home_countries_cache";

export const clearHomeCountriesCache = () => {
  supportedLanguages.forEach(({ code }) => {
    try {
      localStorage.removeItem(`${HOME_COUNTRIES_CACHE_BASE_KEY}_${code}`);
    } catch (error) {
      console.error(`Error clearing home cache for ${code}:`, error);
    }
  });
};

export const getStoredVersion = () => {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY);
  } catch (error) {
    console.error("Error reading version from localStorage:", error);
    return null;
  }
};

export const setStoredVersion = (version) => {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
  } catch (error) {
    console.error("Error saving version to localStorage:", error);
  }
};

export const clearCacheIfVersionChanged = (newVersion) => {
  const storedVersion = getStoredVersion();

  if (storedVersion !== newVersion) {
    try {
      clearHomeCountriesCache();
      setStoredVersion(newVersion);
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
  return false;
};
