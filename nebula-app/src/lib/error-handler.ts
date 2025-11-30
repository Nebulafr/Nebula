import { toast } from "react-toastify";

export function handleAndToastError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  console.error(error);
  toast.error(errorMessage);
}
