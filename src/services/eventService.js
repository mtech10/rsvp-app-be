import { apiFetch } from "./api";

export async function getEvents(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  const response = await api.get(query ? `/events?${query}` : "/events");

  return response.data;
}

export async function getNearbyEvents({
  latitude,
  longitude,
  radius = 25000,
  category,
  search,
} = {}) {
  const searchParams = new URLSearchParams();

  searchParams.set("latitude", latitude);

  searchParams.set("longitude", longitude);

  searchParams.set("radius", radius);

  if (category) {
    searchParams.set("category", category);
  }

  if (search) {
    searchParams.set("search", search);
  }

  const response = await api.get(`/events/nearby?${searchParams.toString()}`);

  return response.data;
}
