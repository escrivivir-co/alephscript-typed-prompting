import { ResponseViewer } from "./ResponseViewer";
import { type RawTypingResponse } from "./types";

interface RawDataSectionProps {
  outgoingPrompt: string;
  incomingResponse: RawTypingResponse[];
}

export function RawDataSection({ outgoingPrompt, incomingResponse }: RawDataSectionProps) {
  return (
    <div className="space-y-4">
      <ResponseViewer
        title=""
        value={outgoingPrompt}
      />
      <ResponseViewer
        title=""
        value={JSON.stringify(incomingResponse, null, 2)}
      />
    </div>
  );
}
