import api from "./api"

export const searchMedicalImage = async (query: string) => {
    const res = await api.post("/templates/search-image", { query });
    return res.data;
}

export const createTemplate = async (data: { name: string; imageUrl?: string | null}) => {
    const res = await api.post("/templates/create", data);
    return res.data;
}

export const getMyTemplates = async () => {
  const res = await api.get("/templates/all");
  return res.data;
}

export const searchSuggestions = async (query: string) => {
  const res = await api.get(`/templates/suggestions?q=${query}`);
  return res.data;
};

export const deleteTemplate = async (id: string) => {
  const res = await api.delete(`/templates/${id}`);
  return res.data;
};