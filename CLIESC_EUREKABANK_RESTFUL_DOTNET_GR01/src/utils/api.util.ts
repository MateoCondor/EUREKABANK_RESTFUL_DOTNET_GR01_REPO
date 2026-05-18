import { AxiosError } from "axios";

export async function executeApiCall<T>(
  callback: () => Promise<T>,
  errorMapper?: Record<number, string>,
) {
  try {
    return await callback();
  } catch (e) {
    let errorMessage = "Ocurrió un error inesperado";

    if (e instanceof AxiosError) {
      if (e.status && errorMapper) {
        errorMessage = errorMapper[e.status] ?? errorMessage;
      }
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }

    throw new Error(errorMessage);
  }
}
