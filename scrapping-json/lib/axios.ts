import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "../env";

export const apiInstance = axios.create({
  baseURL: env.API_URL,
});

if (env.API_URL) {
  apiInstance.interceptors.request.use(async (config) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return config;
  });
}

apiInstance.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setupInterceptors = (token: string) => {
  apiInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export interface IGenericRequest<T> {
  method: AxiosRequestConfig['method'];
  url: string;
  data?: T;
  params?: any;
}

export async function makeRequest<ResponseType, RequestData = any>(
  request: IGenericRequest<RequestData>
): Promise<AxiosResponse<ResponseType>> {
  const { method, url, data, params } = request;
  const requestConfig: AxiosRequestConfig = {
    method,
    url,
    data,
    params,
  };

  const response: AxiosResponse<ResponseType> = await apiInstance(requestConfig);
  return response;
}