import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import type { ValidationReport } from "@shared/schema";

interface ValidationHistoryEntry {
  prompt: string;
  response: string;
  validationReport: ValidationReport;
  timestamp: string;
}

type FilterType = 'all' | 'validated' | 'failed';

export function ConversationTree() {
  const [history, setHistory] = useState<ValidationHistoryEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const savedHistory = localStorage.getItem('validationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const filteredHistory = history.filter(entry => {
    if (filter === 'validated') return entry.validationReport.valid;
    if (filter === 'failed') return !entry.validationReport.valid;
    return true;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Structured Conversations
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'validated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('validated')}
              className="text-green-500"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Validated
            </Button>
            <Button
              variant={filter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('failed')}
              className="text-red-500"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Failed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No conversations found
            </div>
          ) : (
            filteredHistory.map((entry, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  {entry.validationReport.valid ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Valid
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      Invalid
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="font-medium">Prompt</div>
                    <div className="text-sm">{entry.prompt}</div>
                  </div>
                  <div>
                    <div className="font-medium">Response</div>
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {entry.response}
                    </div>
                  </div>
                  {!entry.validationReport.valid && entry.validationReport.errors.length > 0 && (
                    <div>
                      <div className="font-medium text-red-500">Validation Errors</div>
                      <ul className="list-disc list-inside text-sm text-red-500">
                        {entry.validationReport.errors.map((error, i) => (
                          <li key={i}>
                            {error.path}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
