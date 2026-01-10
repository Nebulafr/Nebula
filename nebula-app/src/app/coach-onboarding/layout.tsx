import Image from "next/image";
import Link from "next/link";
import { logos } from "@/lib/images/logos";

export default function CoachOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}
