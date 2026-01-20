import { toast } from "react-toastify";

export function handleAndToastError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;

  if (error && typeof error === "object" && "message" in error) {
    errorMessage = (error as { message: string }).message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  console.error("Error caught:", error);
  toast.error(errorMessage);
}
