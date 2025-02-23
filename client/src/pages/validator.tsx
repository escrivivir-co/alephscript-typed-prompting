import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Schema, type ValidationReport } from "@shared/schema";
import { CheckCircle, XCircle, Copy, Upload, ChevronDown } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { clsx } from "clsx";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function Validator() {
    const [location] = useLocation();
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const initialSchemaId = searchParams.get("schemaId");

    const [selectedSchema, setSelectedSchema] = useState<string>(
        initialSchemaId || ""
    );
    const [input, setInput] = useState("");
    const [report, setReport] = useState<ValidationReport>();
    const { toast } = useToast();

    const { data: schemas } = useQuery<Schema[]>({
        queryKey: ["/api/schemas"],
    });

    const validateMutation = useMutation({
        mutationFn: async () => {
            if (!selectedSchema) throw new Error("No schema selected");

            let jsonData;
            try {
                const formattedInput = input.replace(/'/g, '"');
                const properlyQuotedInput = formattedInput.replace(
                    /(\w+):/g,
                    '"$1":'
                );
                jsonData = JSON.parse(properlyQuotedInput);
            } catch (err) {
                throw new Error(
                    "Invalid JSON format. Please check your input."
                );
            }

            const res = await apiRequest(
                "POST",
                `/api/validate/${selectedSchema}`,
                jsonData
            );
            const data = await res.json();
            setReport(data);
            return data;
        },
        onError: (error) => {
            toast({
                title: "Validation Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to validate JSON",
                variant: "destructive",
            });
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setInput(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleCopy = () => {
        if (report) {
            navigator.clipboard.writeText(JSON.stringify(report, null, 2));
            toast({
                title: "Copied",
                description: "Report copied to clipboard",
            });
        }
    };

    const handleDownload = () => {
        if (report) {
            const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "validation-report.json";
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>JSON Validator</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select
                        value={selectedSchema}
                        onValueChange={setSelectedSchema}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a schema" />
                        </SelectTrigger>
                        <SelectContent>
                            {schemas?.map((schema) => (
                                <SelectItem
                                    key={schema.id}
                                    value={schema.id.toString()}
                                >
                                    {schema.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Accordion
                        type="single"
                        defaultValue="validation-results"
                        collapsible
                    >
                        <AccordionItem value="validation-results">
                            <AccordionTrigger
                                className={clsx(
                                    "px-4 py-2 rounded-t-lg",
                                    report?.valid !== undefined
                                        ? report.valid
                                            ? "bg-green-500/10 dark:bg-green-500/20"
                                            : "bg-red-500/10 dark:bg-red-500/20"
                                        : "bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {report?.valid !== undefined ? (
                                        report.valid ? (
                                            <>
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="text-green-600 dark:text-green-400">
                                                    Schema Validation Passed
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 text-red-500" />
                                                <span className="text-red-600 dark:text-red-400">
                                                    Schema Validation Failed
                                                </span>
                                            </>
                                        )
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Validation Results
                                        </span>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="border rounded-lg overflow-hidden mt-2">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Field</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Details</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!report ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="text-center text-muted-foreground"
                                                    >
                                                        No validation performed
                                                        yet. Select a schema and
                                                        input JSON to validate.
                                                    </TableCell>
                                                </TableRow>
                                            ) : report.errors &&
                                              report.errors.length > 0 ? (
                                                report.errors.map(
                                                    (error, index) => (
                                                        <TableRow
                                                            key={index}
                                                            className="bg-red-50/50 dark:bg-red-900/20"
                                                        >
                                                            <TableCell className="font-medium">
                                                                {error.path ||
                                                                    "Schema"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="flex items-center gap-1 text-red-500">
                                                                    <XCircle className="h-4 w-4" />
                                                                    Invalid
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {error.message}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )
                                            ) : (
                                                <TableRow className="bg-green-50/50 dark:bg-green-900/20">
                                                    <TableCell className="font-medium">
                                                        Schema
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1 text-green-500">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Valid
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        All schema requirements
                                                        are satisfied
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div>
                        <div className="flex gap-4 mb-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    document
                                        .getElementById("json-upload")
                                        ?.click()
                                }
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload JSON File
                            </Button>
                            <input
                                id="json-upload"
                                type="file"
                                accept=".json,.txt"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </div>
                        <div className="border rounded-md">
                            <CodeEditor
                                value={input}
                                onChange={setInput}
                                language="json"
                                height="200px"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => validateMutation.mutate()}
                        className="w-full"
                        disabled={
                            validateMutation.isPending ||
                            !selectedSchema ||
                            !input.trim()
                        }
                    >
                        {validateMutation.isPending
                            ? "Validating..."
                            : "Validate"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
