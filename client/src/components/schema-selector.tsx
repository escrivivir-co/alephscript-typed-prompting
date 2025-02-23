import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type Schema, type Library } from "@shared/schema";
import { FileJson, Tag, CalendarDays, Code2, Library as LibraryIcon, Maximize2 } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SchemaSelectorProps {
  schemas?: Schema[];
  libraries?: Library[];
  selectedSchemaId?: string | number;
  onSchemaSelect?: (schemaId: string) => void;
  showActions?: boolean;
  onEdit?: (schemaId: number) => void;
  onValidate?: (schemaId: number) => void;
  className?: string;
}

export function SchemaSelector({
  schemas,
  libraries,
  selectedSchemaId,
  onSchemaSelect,
  showActions = true,
  onEdit,
  onValidate,
  className = ""
}: SchemaSelectorProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("all");

  const categories = schemas
    ? Array.from(new Set(schemas.map(s => s.category || "uncategorized")))
    : [];

  const filteredSchemas = schemas?.filter(schema => {
    const matchesCategory = categoryFilter === "all" || schema.category === categoryFilter;
    const matchesLibrary = selectedLibrary === "all" || schema.libraryId?.toString() === selectedLibrary;
    const matchesSearch = !searchTerm ||
      schema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.labels?.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch && matchesLibrary;
  });

  return (
    <div className={className}>
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name or labels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category, index) => (
              <SelectItem key={`category-${index}-${category}`} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by library" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Libraries</SelectItem>
            {libraries?.map((library) => (
              <SelectItem key={library.id} value={library.id.toString()}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemas?.map((schema) => (
          <SchemaCard
            key={schema.id}
            schema={schema}
            libraries={libraries}
            isSelected={selectedSchemaId?.toString() === schema.id.toString()}
            onSelect={onSchemaSelect}
            showActions={showActions}
            onEdit={onEdit}
            onValidate={onValidate}
          />
        ))}
      </div>
    </div>
  );
}

interface SchemaCardProps {
  schema: Schema;
  libraries?: Library[];
  isSelected?: boolean;
  onSelect?: (schemaId: string) => void;
  showActions?: boolean;
  onEdit?: (schemaId: number) => void;
  onValidate?: (schemaId: number) => void;
}

function SchemaCard({
  schema,
  libraries,
  isSelected,
  onSelect,
  showActions,
  onEdit,
  onValidate
}: SchemaCardProps) {
  const library = libraries?.find(l => l.id === schema.libraryId);
  const cardClassName = `relative ${isSelected ? 'ring-2 ring-primary' : ''}`;
  const [tsFullScreen, setTsFullScreen] = useState(false);
  const [jsonFullScreen, setJsonFullScreen] = useState(false);

  // Format JSON schema for display
  const formattedJsonSchema = schema.jsonSchema ?
    JSON.stringify(JSON.parse(schema.jsonSchema), null, 2) :
    '{}';

  return (
    <Card className={cardClassName} onClick={() => onSelect?.(schema.id.toString())}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {schema.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Tag className="h-4 w-4 mr-1" />
            {schema.category || "Uncategorized"}
          </div>
          {library && (
            <div className="flex items-center text-sm text-muted-foreground">
              <LibraryIcon className="h-4 w-4 mr-1" />
              {library.name}
            </div>
          )}
          {schema.labels && schema.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {schema.labels.map((label, labelIndex) => (
                <Badge
                  key={`${schema.id}-label-${labelIndex}`}
                  variant="secondary"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-1" />
            {new Date(schema.createdAt).toLocaleDateString()}
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="typescript">
              <div className="flex items-center justify-between">
                <AccordionTrigger className="text-sm flex-1">
                  <Code2 className="h-4 w-4 mr-2" />
                  TypeScript Interface
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTsFullScreen(true);
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">View full screen</span>
                </Button>
              </div>
              <AccordionContent>
                <div className="border rounded-md bg-muted/40">
                  <CodeEditor
                    value={schema.typeScript}
                    onChange={() => {}}
                    language="typescript"
                    height="200px"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="json">
              <div className="flex items-center justify-between">
                <AccordionTrigger className="text-sm flex-1">
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON Schema
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setJsonFullScreen(true);
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">View full screen</span>
                </Button>
              </div>
              <AccordionContent>
                <div className="border rounded-md bg-muted/40">
                  <CodeEditor
                    value={formattedJsonSchema}
                    onChange={() => {}}
                    language="json"
                    height="200px"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {showActions && (
            <div className="flex gap-2">
              {onValidate && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onValidate(schema.id);
                  }}
                >
                  Use Validator
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(schema.id);
                  }}
                >
                  Edit Schema
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={tsFullScreen} onOpenChange={setTsFullScreen}>
        <DialogContent className="max-w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>TypeScript Interface</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={schema.typeScript}
              onChange={() => {}}
              language="typescript"
              height="calc(90vh - 80px)"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={jsonFullScreen} onOpenChange={setJsonFullScreen}>
        <DialogContent className="max-w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>JSON Schema</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={formattedJsonSchema}
              onChange={() => {}}
              language="json"
              height="calc(90vh - 80px)"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}