import { api } from "./axios";

export const assignBundle = async (payload) => {
  return await api.post(`api/v1/user/bundle/assign`, payload);
};

export const assignTopupBundle = async (payload) => {
  return await api.post(`api/v1/user/bundle/assign-top-up`, payload);
};

export const getOrderByID = async (payload) => {
  return await api.get(`api/v1/user/my-esim-by-order/${payload}`, {
    params: { ...payload },
  });
};

export const getOrdersHistory = async (payload) => {
  return await api.get(`api/v1/user/order-history`, {
    params: { ...payload },
  });
};

export const getOrderHistoryById = async (payload) => {
  return await api.get(`api/v1/user/order-history/${payload}`, {
    params: { ...payload },
  });
};

export const getUserNotifications = async (payload) => {
  return await api.get(`api/v1/user/user-notification`, {
    params: { ...payload },
  });
};

export const getMyEsim = async (payload) => {
  return await api.get(`api/v1/user/my-esim`, {
    params: { ...payload },
  });
};

export const getMyEsimByIccid = async (payload) => {
  return await api.get(`api/v1/user/my-esim/${payload}`, {
    params: { ...payload },
  });
};

export const getEsimRelatedTopup = async ({ bundle_code, iccid }) => {
  return await api.get(`api/v1/user/related-topup/${bundle_code}/${iccid}`);
};

export const updateBundleLabelByIccid = async (payload) => {
  return await api.post(`api/v1/user/bundle-label-by-iccid/${payload?.code}`, {
    ...payload,
  });
};

export const checkBundleExist = async (payload) => {
  return await api.get(`api/v1/user/bundle-exists/${payload}`);
};

export const getMyEsimConsumption = async (payload) => {
  return await api.get(`api/v1/user/consumption/${payload}`);
};

export const markAsRead = async (payload) => {
  return await api.post(`api/v1/user/read-user-notification/`);
};

export const verifyOrderOTP = async (payload) => {
  return await api.post(`api/v1/user/bundle/verify_order_otp`, payload);
};

export const cancelOrder = async (payload) => {
  return await api.delete(`api/v1/user/order/cancel/${payload}`);
};
