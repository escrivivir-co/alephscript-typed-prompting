import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { type ValidationReport } from "./types";
import { ValidationReport as ValidationReportComponent } from "./ValidationReport";

interface ValidationSectionProps {
  report: ValidationReport;
  onValidate: () => void;
  onCopy: () => void;
  response: string;
  selectedSchema: string;
}

export function ValidationSection({
  report,
  onValidate,
  onCopy,
  response,
  selectedSchema
}: ValidationSectionProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-4">
      <Button
        onClick={onValidate}
        disabled={!response || !selectedSchema}
        className="w-full"
      >
        Validate Response
      </Button>
      <ValidationReportComponent
        report={report}
        onCopy={onCopy}
        onAddToConversation={() => setLocation('/structured-conversations')}
      />
    </div>
  );
}
