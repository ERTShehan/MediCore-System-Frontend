import api from "./api";

export const loginUser = async (data: any) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerDoctor = async (data: any) => {
  const res = await api.post("/auth/register-doctor", data);
  return res.data;
};

export const registerCounter = async (data: any) => {
  const res = await api.post("/auth/register-counter", data);
  return res.data;
};

export const getMyDetails = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const refreshTokens = async (refreshToken: string) => {
  const res = await api.post("/auth/refresh", { token: refreshToken });
  return res.data;
};

export const updateDoctorProfile = async (formData: FormData) => {
  const res = await api.put("/auth/profile/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const changePassword = async (data: any) => {
  const res = await api.put("/auth/password/change", data);
  return res.data;
};

export const sendForgotPasswordOTP = async (email: string) => {
  const res = await api.post("/auth/password/forgot/otp", { email });
  return res.data;
};

export const resetPasswordWithOTP = async (data: any) => {
  const res = await api.post("/auth/password/reset", data);
  return res.data;
};