import { api } from "./api";

export async function getRecommendedEvents() {
  const response = await api.get("/recommendations");

  return response.data;
}
