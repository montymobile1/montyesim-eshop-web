import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { queryClient } from "../../main";
import {
  clearCacheIfVersionChanged,
  getStoredVersion,
  setStoredVersion,
} from "../version-storage/versionStorage";

import { getHomePageContent } from "../apis/homeAPI";
import { useQuery } from "react-query";
import i18n from "../../i18n";

export const VERSION_STORAGE_KEY = "app_bundles_version";

export const useHomeCountries = () => {
  const bundles_version = useSelector(
    (state) => state?.currency?.bundles_version
  );
  const language = i18n.language;

  const cacheKey = `home_countries_cache_${language}`;

  return useQuery({
    queryKey: ["home-countries", bundles_version, language],
    queryFn: async () => {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        const storedVersion = getStoredVersion();

        if (cachedData && storedVersion === bundles_version) {
          return JSON.parse(cachedData);
        } else {
          localStorage.removeItem(cacheKey);

          setStoredVersion(bundles_version);
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
