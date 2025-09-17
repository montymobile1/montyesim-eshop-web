import { api } from "./axios";

export const topupWallet = async (payload) => {
  try {
    const res = await api.post("api/v1/wallet/top-up", payload);
    return res;
  } catch (error) {
    throw error;
  }
};
