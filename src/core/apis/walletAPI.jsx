import { api } from "./axios";

export const topupWallet = async (payload) => {
  return await api.post("api/v1/wallet/top-up", payload);
};
