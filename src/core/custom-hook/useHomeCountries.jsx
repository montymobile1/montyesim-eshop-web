import { useSelector } from "react-redux";
import {
  clearHomeCountriesCache,
  getStoredVersion,
  setStoredVersion,
} from "../version-storage/versionStorage";

import { useQuery } from "react-query";
import i18n from "../../i18n";
import { getHomePageContent } from "../apis/homeAPI";

export const VERSION_STORAGE_KEY = "app_bundles_version";

export const useHomeCountries = () => {
  const bundles_version = useSelector(
    (state) => state?.currency?.bundles_version,
  );
  const language = i18n.language;

  const cacheKey = `home_countries_cache_${language}`;

  return useQuery({
    queryKey: ["home-countries", bundles_version, language],
    queryFn: async () => {
      try {
        const storedVersion = getStoredVersion();

        if (storedVersion !== bundles_version) {
          //EXPLANATION: version changed → clear home cache for all languages once
          clearHomeCountriesCache();
          setStoredVersion(bundles_version);
        } else {
          //EXPLANATION: same version → serve this language's cache if present.
          //A cache miss here (e.g. first time on a new language) must NOT clear
          //the other languages' caches.
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            return JSON.parse(cachedData);
          }
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }

      //EXPLANATION:  If no cached data or version mismatch, fetch from API
      const response = await getHomePageContent();
      const data = response?.data?.data;

      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!bundles_version,
  });
};
