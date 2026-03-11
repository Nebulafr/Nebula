import { useQuery } from "@tanstack/react-query";
import { getCoachById } from "@/actions/coaches";
import { getCoachStudents } from "@/actions/session";
import { getStripeBalance, getCoachEarnings, getCoachPayouts, getStripeStatus } from "@/actions/stripe";
import { CoachStudent } from "@/types/coach";

export function useCoachById(coachId: string) {
  return useQuery({
    queryKey: ["coach", coachId],
    queryFn: async () => {
      const response = await getCoachById(coachId);

      if (response.success && response.data?.coach) {
        return response.data.coach;
      }

      throw new Error(response.error || "Failed to fetch coach");
    },
    enabled: !!coachId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}


export function useCoachStudents() {
  return useQuery({
    queryKey: ["coach", "students"],
    queryFn: async () => {
      const response = await getCoachStudents();

      if (response.success && response.data?.students) {
        return response.data.students as CoachStudent[];
      }

      throw new Error(response.error || "Failed to fetch students");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}
export function useStripeStatus() {
  return useQuery({
    queryKey: ["coach", "stripe-status"],
    queryFn: async () => {
      const response = await getStripeStatus();
      if (response.success) return response.data;
      throw new Error(response.error || "Failed to fetch Stripe status");
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStripeBalance() {
  return useQuery({
    queryKey: ["coach", "stripe-balance"],
    queryFn: async () => {
      const response = await getStripeBalance();
      if (response.success) return response.data;
      throw new Error(response.error || "Failed to fetch Stripe balance");
    },
    refetchInterval: 30000,
  });
}

export function useCoachEarnings() {
  return useQuery({
    queryKey: ["coach", "earnings"],
    queryFn: async () => {
      const response = await getCoachEarnings();
      if (response.success) return response.data;
      throw new Error(response.error || "Failed to fetch earnings");
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCoachPayouts(limit: number = 10) {
  return useQuery({
    queryKey: ["coach", "payouts", limit],
    queryFn: async () => {
      const response = await getCoachPayouts(limit);
      if (response.success) return response.data;
      throw new Error(response.error || "Failed to fetch payouts");
    },
    staleTime: 5 * 60 * 1000,
  });
}
