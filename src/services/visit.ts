import api from "./api";

//Counter: Create Visit
export const createVisit = async (data: { patientName: string; age: string; phone: string }) => {
  const res = await api.post("/visits/create", data);
  return res.data;
};

//Doctor: Call Next Patient
export const requestNextPatient = async () => {
  const res = await api.post("/visits/next", {});
  return res.data;
};

//Doctor: Submit Treatment
export const submitTreatment = async (id: string, data: { diagnosis: string; prescription: string }) => {
  const res = await api.put(`/visits/complete/${id}`, data);
  return res.data;
};

//Doctor: Get Patient History
export const getPatientHistory = async (phone: string) => {
  const res = await api.get(`/visits/history/${phone}`);
  return res.data;
};

// Counter: Get Queue Status (Alerts & Completed List)
export const getQueueStatus = async () => {
  const res = await api.get("/visits/status");
  return res.data; // Returns { currentPatient, completedList, allPatients }
};

// Counter: Get Details for Print
export const getVisitDetails = async (id: string) => {
  const res = await api.get(`/visits/details/${id}`);
  return res.data;
};

export const getAllTodayVisits = async () => {
  const res = await api.get("/visits/today");
  return res.data;
};