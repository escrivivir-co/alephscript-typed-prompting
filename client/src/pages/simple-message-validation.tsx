import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Schema, type ValidationReport } from "@shared/schema";
import { CheckCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SimpleMessageValidation() {
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [message, setMessage] = useState("");
  const [report, setReport] = useState<ValidationReport>();
  const { toast } = useToast();

  const { data: schemas } = useQuery<Schema[]>({
    queryKey: ["/api/schemas"]
  });

  const validateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSchema) throw new Error("No schema selected");

      try {
        // Try to parse the message as JSON first
        const jsonData = JSON.parse(message.trim());
        const res = await apiRequest("POST", `/api/validate/${selectedSchema}`, jsonData);
        const data = await res.json();
        setReport(data);
        return data;
      } catch (err) {
        // If parsing fails, show error
        throw new Error("Invalid JSON format in the message. Please check if the message contains valid JSON.");
      }
    },
    onError: (error) => {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Failed to validate message",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Message Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schema Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Schema</label>
            <Select value={selectedSchema} onValueChange={setSelectedSchema}>
              <SelectTrigger>
                <SelectValue placeholder="Select a schema to validate against" />
              </SelectTrigger>
              <SelectContent>
                {schemas?.map((schema) => (
                  <SelectItem key={schema.id} value={schema.id.toString()}>
                    {schema.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Validation Results */}
          {report && (
            <Card className={clsx(
              "border-2",
              report.valid
                ? "border-green-500/20 dark:border-green-500/30"
                : "border-red-500/20 dark:border-red-500/30"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {report.valid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Message is Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">Message is Invalid</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!report.valid && report.errors && report.errors.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Validation Errors:</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Path</TableHead>
                            <TableHead>Error Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.errors.map((error, i) => (
                            <TableRow
                              key={i}
                              className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                            >
                              <TableCell className="font-medium">
                                {error.path || "root"}
                              </TableCell>
                              <TableCell>{error.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Message</label>
            <Textarea
              placeholder="Paste your message here..."
              className="min-h-[200px] font-mono"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Validate Button */}
          <Button
            onClick={() => validateMutation.mutate()}
            className="w-full"
            disabled={validateMutation.isPending || !selectedSchema || !message.trim()}
          >
            {validateMutation.isPending ? "Validating..." : "Validate Message"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
