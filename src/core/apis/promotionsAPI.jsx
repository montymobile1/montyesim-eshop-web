import { api } from "./axios";

export const validatePromo = async (payload) => {
  return await api.post(`api/v1/promotion/validation`, payload);
};

export const redeemVoucher = async (payload) => {
  return await api.post(`api/v1/voucher/redeem`, payload);
};

export const getUserRewards = async (payload) => {
  return await api.get(`api/v1/promotion/history`, {
    params: { ...payload },
  });
};
