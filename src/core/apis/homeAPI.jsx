import i18n from "../../i18n";
import { api } from "./axios";

export const getHomePageContent = async () => {
  try {
    const res = await api.get("api/v1/home/", {
      params: {
        bundle_version: localStorage.getItem("app_bundles_version"),
        language: i18n.language,
      },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getCruiseContent = async () => {
  try {
    const res = await api.get("api/v1/home/cruise");
    return res;
  } catch (error) {
    throw error;
  }
};

export const getLandContent = async () => {
  try {
    const res = await api.get("api/v1/home/land");
    return res;
  } catch (error) {
    throw error;
  }
};

export const getBundlesByCountry = async (payload) => {
  try {
    const res = await api.get("api/v1/bundles/by-country", {
      params: { country_codes: payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getBundlesByRegion = async (payload) => {
  try {
    const res = await api.get(`api/v1/bundles/by-region/${payload}`, {});
    return res;
  } catch (error) {
    throw error;
  }
};

export const contactUs = async (payload) => {
  try {
    const res = await api.post("api/v1/app/contact", payload);
    return res;
  } catch (error) {
    return error;
  }
};

export const getAboutusContent = async () => {
  try {
    const res = await api.get("api/v1/app/about_us");
    return res;
  } catch (error) {
    return error;
  }
};

export const getTermsContent = async () => {
  try {
    const res = await api.get("api/v1/app/terms-and-conditions");
    return res;
  } catch (error) {
    return error;
  }
};

export const getPrivacyPolicyContent = async () => {
  try {
    const res = await api.get("api/v1/app/privacy_policy");
    return res;
  } catch (error) {
    return error;
  }
};

export const getFAQContent = async () => {
  try {
    const res = await api.get("api/v1/app/faq");
    return res;
  } catch (error) {
    return error;
  }
};

export const getBannersContent = async () => {
  try {
    const res = await api.get("api/v1/app/banners");
    return res;
  } catch (error) {
    return error;
  }
};

export const getReferEarnContent = async () => {
  try {
    const res = await api.get("api/v1/promotion/referral-info");
    return res;
  } catch (error) {
    return error;
  }
};
