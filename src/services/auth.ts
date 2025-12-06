import api from "./api";

// Login API Call
export const loginUser = async (data: any) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// Register Doctor API Call
export const registerDoctor = async (data: any) => {
  const res = await api.post("/auth/register-doctor", data);
  return res.data;
};

// Get User Profile API Call
export const getMyDetails = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};