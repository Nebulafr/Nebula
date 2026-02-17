import { useMutation } from "@tanstack/react-query";
import {
    createProgramCheckout,
    createSessionCheckout,
    createEventCheckout,
} from "@/actions/checkout";
import { handleAndToastError } from "@/lib/error-handler";

export function useProgramCheckout() {
    return useMutation({
        mutationFn: (data: Parameters<typeof createProgramCheckout>[0]) =>
            createProgramCheckout(data),
        onError: (error: any) => {
            handleAndToastError(error, "Failed to initiate program checkout.");
        },
    });
}

export function useSessionCheckout() {
    return useMutation({
        mutationFn: (data: Parameters<typeof createSessionCheckout>[0]) =>
            createSessionCheckout(data),
        onError: (error: any) => {
            handleAndToastError(error, "Failed to initiate session checkout.");
        },
    });
}

export function useEventCheckout() {
    return useMutation({
        mutationFn: (data: Parameters<typeof createEventCheckout>[0]) =>
            createEventCheckout(data),
        onError: (error: any) => {
            handleAndToastError(error, "Failed to initiate event checkout.");
        },
    });
}
