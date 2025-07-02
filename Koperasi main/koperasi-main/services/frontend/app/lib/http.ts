import axios from "axios";
import getEnv from "./get-env";

const env = getEnv();

export const httpClient = axios.create({
  baseURL: env.API_BASE_URL,
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("UNAUTHORIZED"));
    }
    return Promise.reject(error);
  },
);
