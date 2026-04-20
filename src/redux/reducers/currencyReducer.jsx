import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConfigurationInfoFromAPI } from "../redux-services/configurationServices";
import { defaultLoginType } from "../../core/variables/ProjectVariables";
import { OTPChannelsMap } from "../../core/variables/StaticVariables";

const initialState = {
  system_currency: "EUR",
  user_currency: null,
  login_type: defaultLoginType || "email",
  otp_channel: OTPChannelsMap?.[defaultLoginType] || ["email"],
  sea_option: true,
  social_login: true,
  allowed_payment_types: ["dcb"],
  whatsapp_number: "",
  bundles_version: null,
  referral_amount: "",
  otp_expiration_time: "",
  transaction_expiry_time: null,
  refer_and_earn: false,
  voucher_code: false,
  company_support_number: "",
  company_support_email: "",
  top_countries_count: 9,
};

//EXPLANATION: I moved the api to authServices to prevent circular dependency
export const fetchCurrencyInfo = createAsyncThunk(
  "currency/fetchSystemCurrency",
  async () => {
    return await fetchConfigurationInfoFromAPI();
  },
);

const CurrencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    UpdateCurrency: (state, action) => {
      return {
        ...state,
        user_currency: action?.payload?.user_currency,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrencyInfo.fulfilled, (state, action) => {
        const data = action.payload?.data?.data ?? [];

        // convert array -> object map with lowercase keys
        const dataMap = data.reduce((acc, item) => {
          if (item?.key) {
            acc[item.key.toLowerCase()] = item;
          }
          return acc;
        }, {});

        const currency = dataMap["default_currency"];
        const referralAmount = dataMap["referral_code_amount"];
        const paymentTypes = dataMap["allowed_payment_types"];
        const loginType = dataMap["login_type"];
        const versionId = dataMap["catalog.bundles_cache_version"];
        const whatsappNumber = dataMap["whatsapp_number"];
        const otp_expiration_time = dataMap["otp_expiration_time"];
        const transaction_expiry_time = dataMap["transaction_expiry_time"];
        const companySupportPhone = dataMap["company_support_phone"];
        const companySupportEmail = dataMap["company_support_email"];
        const topCountriesCount = dataMap["top_countries_count"];

        state.bundles_version = versionId?.value || null;
        state.login_type = loginType?.value || defaultLoginType || "email";
        state.otp_expiration_time = otp_expiration_time?.value || "";
        state.top_countries_count = topCountriesCount?.value || 9;
        state.otp_channel =
          OTPChannelsMap?.[loginType?.value] ||
          OTPChannelsMap?.[defaultLoginType] ||
          "email";

        state.sea_option = import.meta.env.VITE_APP_SEA_OPTION !== "false";
        state.refer_and_earn =
          import.meta.env.VITE_APP_REFER_AND_EARN === "true";
        state.voucher_code = import.meta.env.VITE_APP_VOUCHER_CODE === "true";
        state.social_login = import.meta.env.VITE_APP_SOCIAL_LOGIN !== "false";
        state.whatsapp_number = whatsappNumber?.value || "";
        state.company_support_number = companySupportPhone?.value || "";
        state.company_support_email = companySupportEmail?.value || "";
        state.system_currency = currency?.value || "EUR";
        state.allowed_payment_types = paymentTypes?.value
          ? paymentTypes.value.split(",")
          : ["wallet"];
        state.transaction_expiry_time = transaction_expiry_time?.value || null;
        state.referral_amount = referralAmount?.value || "";
        state.isLoading = false;
      })
      .addCase(fetchCurrencyInfo.rejected, (state, action) => {
        //render config related to env even if configuration api failed
        state.login_type = defaultLoginType;
        state.bundles_version = "";
        state.otp_expiration_time = "";
        state.otp_channel = OTPChannelsMap?.[defaultLoginType] || "email";
        state.sea_option = import.meta.env.VITE_APP_SEA_OPTION !== "false";
        state.refer_and_earn =
          import.meta.env.VITE_APP_REFER_AND_EARN === "true";
        state.voucher_code = import.meta.env.VITE_APP_VOUCHER_CODE === "true";
        state.social_login = import.meta.env.VITE_APP_SOCIAL_LOGIN !== "false";
        state.transaction_expiry_time = null;
        state.top_countries_count = 9;
        state.allowed_payment_types = ["dcb"];
        state.system_currency = "EUR";
        state.whatsapp_number = "";
        state.company_support_number = "";
        state.company_support_email = "";
        state.referral_amount = "";
        state.isLoading = false;

        state.error = action.payload;
      });
  },
});

export const { UpdateCurrency } = CurrencySlice.actions;
export default CurrencySlice.reducer;
