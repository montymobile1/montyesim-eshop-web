import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConfigurationInfoFromAPI } from "../redux-services/configurationServices";

const initialState = {
  system_currency: "EUR",
  user_currency: null,
  login_type: "email",
  otp_channel: ["email"],
  sea_option: true,
  social_login: true,
  allowed_payment_types: ["dcb"],
  whatsapp_number: "",
  bundles_version: null,
  referral_amount: "",
  otp_expiration_time: "",
};

//EXPLANATION: I moved the api to authServices to prevent circular dependency
export const fetchCurrencyInfo = createAsyncThunk(
  "currency/fetchSystemCurrency",
  async () => {
    return await fetchConfigurationInfoFromAPI();
  }
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

        // helper to find key ignoring case
        const findByKey = (key) =>
          data.find((el) => el?.key?.toLowerCase() === key.toLowerCase());

        let currency = findByKey("default_currency");
        let referralAmount = findByKey("REFERRAL_CODE_AMOUNT");
        let paymentTypes = findByKey("allowed_payment_types");
        let loginType = findByKey("login_type");
        let versionId = findByKey("CATALOG.BUNDLES_CACHE_VERSION");
        let whatsappNumber = findByKey("WHATSAPP_NUMBER");
        let otp_expiration_time = findByKey("OTP_EXPIRATION_TIME");
        state.bundles_version = versionId?.value || null;
        state.login_type = loginType?.value || "email";
        state.otp_expiration_time = otp_expiration_time?.value || "";
        state.otp_channel = import.meta.env.VITE_APP_OTP_CHANNEL
          ? import.meta.env.VITE_APP_OTP_CHANNEL.split(",")
          : ["email"];

        state.sea_option = import.meta.env.VITE_APP_SEA_OPTION
          ? import.meta.env.VITE_APP_SEA_OPTION === "true"
          : true;

        state.social_login = import.meta.env.VITE_APP_SOCIAL_LOGIN
          ? import.meta.env.VITE_APP_SOCIAL_LOGIN === "true"
          : true;

        state.whatsapp_number = whatsappNumber?.value || "";
        state.system_currency = currency?.value || "EUR";
        state.allowed_payment_types = paymentTypes?.value
          ? paymentTypes.value.split(",")
          : ["wallet"];

        state.referral_amount = referralAmount?.value || "";
        state.isLoading = false;
      })
      .addCase(fetchCurrencyInfo.rejected, (state, action) => {
        //render config related to env even if configuration api failed
        state.login_type = "email";
        state.bundles_version = "";
        state.otp_expiration_time = "";
        state.otp_channel = import.meta.env.VITE_APP_OTP_CHANNEL
          ? import.meta.env.VITE_APP_OTP_CHANNEL.split(",")
          : ["email"];
        state.sea_option = import.meta.env.VITE_APP_SEA_OPTION
          ? import.meta.env.VITE_APP_SEA_OPTION === "true"
            ? true
            : false
          : true;
        state.social_login = import.meta.env.VITE_APP_SOCIAL_LOGIN
          ? import.meta.env.VITE_APP_SOCIAL_LOGIN === "true"
            ? true
            : false
          : true;

        state.allowed_payment_types = ["dcb"];
        state.system_currency = "EUR";
        state.whatsapp_number = "";
        state.referral_amount = "";
        state.isLoading = false;

        state.error = action.payload;
      });
  },
});

export const { UpdateCurrency } = CurrencySlice.actions;
export default CurrencySlice.reducer;
