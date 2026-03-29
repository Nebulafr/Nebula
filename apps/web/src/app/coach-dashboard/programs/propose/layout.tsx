import { ReactNode } from "react";
import { ProposeProgramProvider } from "./context/propose-program-context";

export default function ProposeProgramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProposeProgramProvider>
      <div className="flex-1 bg-muted/30 p-4 md:p-8 flex items-start justify-center">
        {children}
      </div>
    </ProposeProgramProvider>
  );
}
