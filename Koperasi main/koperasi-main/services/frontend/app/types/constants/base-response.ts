export type BaseResponse<T> = {
  message?: string;
  data?: T;
  error?: Record<string, string>;
};
