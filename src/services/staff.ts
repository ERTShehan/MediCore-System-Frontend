import api from "./api";

export const getMyStaff = async () => {
  const res = await api.get("/staff/all");
  return res.data; // Returns { data: [...] }
};

export const createStaff = async (data: any) => {
  const res = await api.post("/staff/create", data);
  return res.data;
};

export const deleteStaff = async (id: string) => {
  const res = await api.delete(`/staff/delete/${id}`);
  return res.data;
};

export const toggleStaffStatus = async (id: string) => {
  const res = await api.patch(`/staff/status/${id}`);
  return res.data;
};