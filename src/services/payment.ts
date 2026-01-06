import api from "./api";

export const initiatePayment = async () => {
  const res = await api.post("/payment/pay");
  return res.data;
};

export const verifyPaymentStatus = async (order_id: string) => {
  const res = await api.post("/payment/verify-manual", { order_id });
  return res.data;
};