import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Copy } from "lucide-react";
import { clsx } from "clsx";
import { type ValidationReport as ValidationReportType } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ValidationReportProps {
  report?: ValidationReportType;
  onCopy?: () => void;
  onAddToConversation?: () => void;
}

const defaultReport: ValidationReportType = {
  valid: false,
  errors: []
};

export function ValidationReport({ report = defaultReport, onCopy, onAddToConversation }: ValidationReportProps) {
  return (
    <Card className={clsx(
      "border-2",
      report.valid
        ? "border-green-500/20 dark:border-green-500/30"
        : "border-red-500/20 dark:border-red-500/30"
    )}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {report.valid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Schema Validation Passed</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Schema Validation Failed</span>
              </>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {onCopy && (
              <Button variant="outline" size="icon" onClick={onCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {onAddToConversation && (
              <Button onClick={onAddToConversation}>
                Add to Conversation
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.errors.length > 0 ? (
              report.errors.map((error, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{error.path}</TableCell>
                  <TableCell>{error.message}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  {report.valid ? "No validation errors found" : "Awaiting validation"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}