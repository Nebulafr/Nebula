import { useMutation } from "@tanstack/react-query";
import {
    createProgramCheckout,
    createSessionCheckout,
    createEventCheckout,
} from "@/actions/checkout";
import { handleAndToastError } from "@/lib/error-handler";
import { CheckoutProgramData, CheckoutSessionData, CheckoutEventData } from "@/lib/validations/checkout";


export function useProgramCheckout() {
    return useMutation({
        mutationFn: (data: CheckoutProgramData) =>
            createProgramCheckout(data),
        onError: (error: unknown) => {
            handleAndToastError(error, "Failed to initiate program checkout.");
        },
    });
}

export function useSessionCheckout() {
    return useMutation({
        mutationFn: (data: CheckoutSessionData) =>
            createSessionCheckout(data),
        onError: (error: unknown) => {
            handleAndToastError(error, "Failed to initiate session checkout.");
        },
    });
}

export function useEventCheckout() {
    return useMutation({
        mutationFn: (data: CheckoutEventData) =>
            createEventCheckout(data),
        onError: (error: unknown) => {
            handleAndToastError(error, "Failed to initiate event checkout.");
        },
    });
}
