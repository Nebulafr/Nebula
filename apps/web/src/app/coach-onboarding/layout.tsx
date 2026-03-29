

import { CoachOnboardingProvider } from "@/contexts/coach-onboarding-context";

export default function CoachOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CoachOnboardingProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1">{children}</main>
      </div>
    </CoachOnboardingProvider>
  );
}
