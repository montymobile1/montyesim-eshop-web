import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  social_login: [],
  enableFb: false,
  enableGoogle: true,
  sea_option: true,
  refer_and_earn: false,
  voucher_code: false,
};

const envSlice = createSlice({
  name: "env",
  initialState,
  reducers: {
    setEnvConfig: (state, action) => {
      const {
        social_login,
        enableFb,
        enableGoogle,
        sea_option,
        refer_and_earn,
        voucher_code,
      } = action.payload;
      if (social_login !== undefined) state.social_login = social_login;
      if (enableFb !== undefined) state.enableFb = enableFb;
      if (enableGoogle !== undefined) state.enableGoogle = enableGoogle;
      if (sea_option !== undefined) state.sea_option = sea_option;
      if (refer_and_earn !== undefined) state.refer_and_earn = refer_and_earn;
      if (voucher_code !== undefined) state.voucher_code = voucher_code;
    },
    initializeEnvConfig: (state) => {
      const socialLoginProviders =
        import.meta.env.VITE_APP_SOCIAL_LOGIN?.split(",")
          .map((v) => v.trim())
          .filter(Boolean) || [];

      state.social_login =
        socialLoginProviders?.length > 0 ? socialLoginProviders : [];
      state.enableGoogle = socialLoginProviders?.includes("google");
      state.enableFb = socialLoginProviders?.includes("facebook");
      state.sea_option = import.meta.env.VITE_APP_SEA_OPTION !== "false";
      state.refer_and_earn = import.meta.env.VITE_APP_REFER_AND_EARN === "true";
      state.voucher_code = import.meta.env.VITE_APP_VOUCHER_CODE === "true";
    },
  },
});

export const { setEnvConfig, initializeEnvConfig } = envSlice.actions;
export default envSlice.reducer;
