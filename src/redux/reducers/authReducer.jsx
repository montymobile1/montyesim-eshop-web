import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchUserInfoFromAPI } from "../redux-services/authServices";
import i18n from "../../i18n";
import { setAnalyticsUserId, clearAnalyticsUserId } from "../../../firebaseconfig";
import { hashEmail } from "../../core/helpers/CommonHelpers";

const initialState = {
  tmp: {
    access_token: null,
    refresh_token: null,
    user_token: null,
    isAuthenticated: false,
  },
  access_token: null,
  refresh_token: null,
  user_token: null,
  user_info: null,
  isLoading: false,
  isAuthenticated: false,
};

//EXPLANATION: I moved the api to authServices to prevent circular dependency
export const fetchUserInfo = createAsyncThunk(
  "authentication/fetchUserInfo",
  async () => {
    return await fetchUserInfoFromAPI();
  }
);

const AuthSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    SignIn: (state, action) => {
      const currencyCode = action?.payload?.user_info?.currency_code;

      if (currencyCode) {
        sessionStorage.setItem("user_currency", currencyCode);
      } else {
        sessionStorage.removeItem("user_currency");
      }

      i18n.changeLanguage(action?.payload?.user_info?.language?.toLowerCase());

      // Set Firebase Analytics user ID with hashed email
      const email = action?.payload?.user_info?.email;
      if (email) {
        const hashedEmail = hashEmail(email);
        setAnalyticsUserId(hashedEmail);
      }

      return {
        ...state,
        tmp: {
          user_token: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
        },
        user_token: action?.payload?.user_token,
        access_token: action?.payload?.access_token,
        refresh_token: action?.payload?.refresh_token,
        user_info: action?.payload?.user_info,
        isAuthenticated: true,
      };
    },
    SignOut: (state, action) => {
      // Clear Firebase Analytics user ID
      clearAnalyticsUserId();

      return {
        ...state,
        ...initialState,
      };
    },
    LimitedSignIn: (state, action) => {
      return {
        ...state,
        tmp: {
          user_token: action?.payload?.user_token,
          access_token: action?.payload?.access_token,
          refresh_token: action?.payload?.refresh_token,
          isAuthenticated: true,
        },
        user_info: action?.payload?.user_info,
        isAuthenticated: false,
      };
    },
    LimitedSignOut: (state, action) => {
      return {
        ...state,
        tmp: {
          user_token: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
        },
      };
    },
    UpdateAuthInfo: (state, action) => {
      return {
        ...state,
        user_info: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user_info = action.payload?.data?.data?.user_info || null;
        state.user_token = action.payload?.data?.data?.user_token;
        state.isLoading = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.user_info = null;
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  SignIn,
  SignOut,
  UpdateAuthInfo,
  LimitedSignOut,
  LimitedSignIn,
} = AuthSlice.actions;
export default AuthSlice.reducer;
