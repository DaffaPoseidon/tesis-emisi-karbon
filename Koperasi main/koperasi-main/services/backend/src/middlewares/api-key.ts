import axios from "axios";

export const configureAxiosInterceptor = (walletServiceUrl: string, walletServiceApiKey: any) => {
  axios.interceptors.request.use(
    (config) => {
      if (config.baseURL === walletServiceUrl || (config.url && config.url.startsWith(walletServiceUrl))) {
        config.headers["x-api-key"] = walletServiceApiKey;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};