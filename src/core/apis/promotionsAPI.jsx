import { api } from "./axios";

export const validatePromo = async (payload) => {
  try {
    const res = await api.post(`api/v1/promotion/validation`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const redeemVoucher = async (payload) => {
  try {
    const res = await api.post(`api/v1/voucher/redeem`, payload);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getUserRewards = async (payload) => {
  try {
    const res = await api.get(`api/v1/promotion/history`, {
      params: { ...payload },
    });
    return res;
  } catch (error) {
    throw error;
  }
};
