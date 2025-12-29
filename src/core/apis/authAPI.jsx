import supabase from "../supabase/SupabaseClient";
import { api } from "./axios";

export const userLimitedLogin = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/tmp-login`, payload);
    return res;
  } catch (error) {
    return error;
  }
};

export const userLogin = async (payload) => {
  return await api.post(`api/v1/auth/login`, payload);
};

export const resendOrderOTP = async (payload) => {
  try {
    const res = await api.post(
      `api/v1/user/bundle/resend_order_otp/${payload}`
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/verify_otp`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const userLogout = async (payload) => {
  return await api.post(`api/v1/auth/logout`, {
    params: { ...payload },
  });
};

export const getUserInfo = async (payload) => {
  try {
    const res = await api.get(`api/v1/auth/user-info`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    return error;
  }
};

export const isUserLoggedIn = async (payload) => {
  return await api.get(`api/v1/auth/validate-token`, {
    params: { ...payload },
  });
};

export const refreshToken = async (payload) => {
  try {
    const res = await api.post(`api/v1/auth/refresh-token`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateUserInfo = async (payload) => {
  return await api.post(`api/v1/auth/user-info`, payload);
};

export const deleteAccount = async (payload) => {
  return await api.delete(`api/v1/auth/delete-account`, {
    data: { ...payload },
  });
};

export const supabaseSignout = async () => {
  await supabase.auth.signOut();
};
