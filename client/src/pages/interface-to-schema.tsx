import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { type Schema, type Library } from "@shared/schema";
import { Plus } from "lucide-react";
import { SchemaSelector } from "@/components/schema-selector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchemaCreator } from "@/components/schema-creator";

export default function InterfaceToSchema() {
  const [showSchemaCreator, setShowSchemaCreator] = useState(false);
  const [editSchemaId, setEditSchemaId] = useState<number | undefined>();

  const { data: schemas } = useQuery<Schema[]>({
    queryKey: ["/api/schemas"]
  });

  const { data: libraries } = useQuery<Library[]>({
    queryKey: ["/api/libraries"]
  });

  const handleEditSchema = (schemaId: number) => {
    setEditSchemaId(schemaId);
    setShowSchemaCreator(true);
  };

  const handleCreateNew = () => {
    setEditSchemaId(undefined);
    setShowSchemaCreator(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interface to Schema Converter</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Schema
          </Button>
        </div>
      </div>

      <SchemaSelector
        schemas={schemas}
        libraries={libraries}
        onEdit={handleEditSchema}
        showActions={true}
      />

      <Dialog 
        open={showSchemaCreator} 
        onOpenChange={(open) => {
          setShowSchemaCreator(open);
          if (!open) setEditSchemaId(undefined);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editSchemaId ? "Edit Schema" : "Create New Schema"}</DialogTitle>
          </DialogHeader>
          <SchemaCreator 
            editId={editSchemaId} 
            onComplete={() => setShowSchemaCreator(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchemaCard({ schema, libraries, onEdit }: { 
  schema: Schema; 
  libraries?: Library[]; 
  onEdit: () => void;
}) {
  const [jsonSchema, setJsonSchema] = useState<string>(JSON.stringify({
    type: "object",
    properties: {},
    required: []
  }, null, 2));
  const [tsFullScreen, setTsFullScreen] = useState(false);
  const [jsonFullScreen, setJsonFullScreen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteSchema = async () => {
    try {
      await apiRequest("DELETE", `/api/schemas/${schema.id}`);

      queryClient.invalidateQueries({ queryKey: ["/api/schemas"] });

      toast({
        title: "Success",
        description: "Schema deleted successfully"
      });

      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schema",
        variant: "destructive"
      });
      console.error('Failed to delete schema:', error);
    }
  };

  const library = libraries?.find(l => l.id === schema.libraryId);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {schema.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Schema</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Schema</span>
            </Button>
          </div>
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

          <Accordion type="multiple" className="w-full">
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
                    value={jsonSchema}
                    onChange={setJsonSchema}
                    language="json"
                    height="200px"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
              value={jsonSchema}
              onChange={setJsonSchema}
              language="json"
              height="calc(90vh - 80px)"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schema</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete "{schema.name}"? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteSchema}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}