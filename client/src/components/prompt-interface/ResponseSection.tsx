import { ResponseViewer } from "./ResponseViewer";
import { ValidationSection } from "./ValidationSection";
import { type ValidationReport } from "./types";

interface ResponseSectionProps {
  response: string;
  selectedSchema: string;
  validationReport: ValidationReport;
  onValidate: () => void;
  onCopy: () => void;
}

export function ResponseSection({
  response,
  selectedSchema,
  validationReport,
  onValidate,
  onCopy
}: ResponseSectionProps) {
  return (
    <div className="space-y-4">
      <ResponseViewer
        title="Generated Response"
        value={response}
        language="json"
      />
      <ValidationSection
        report={validationReport}
        onValidate={onValidate}
        onCopy={onCopy}
        response={response}
        selectedSchema={selectedSchema}
      />
    </div>
  );
}
