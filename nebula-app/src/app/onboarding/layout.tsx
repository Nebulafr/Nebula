import { StudentOnboardingProvider } from "@/contexts/student-onboarding-context";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentOnboardingProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1">{children}</main>
      </div>
    </StudentOnboardingProvider>
  );
}
