import { showErrorDialog } from "@/util/myConfirm";
import { AxiosError } from "axios";

export const asyncWrapper = <T>(
  promise: Promise<T>,
  options: {
    isShowError: boolean;
  } = {
    isShowError: true,
  }
) => {
  return promise.catch((error) => {
    console.error("Error:", error);
    if (options.isShowError) {
      showErrorDialog(errorHandler(error)?.message ?? "エラーが発生しました");
    } else {
      throw error;
    }
  });
};

export const errorHandler = (error: any) => {
  if (error instanceof AxiosError) {
    console.error("AxiosError:", error);
    const response = error.response;
    return response?.data;
  }
};
