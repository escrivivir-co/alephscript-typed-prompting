import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { convertTypeScriptToJsonSchema } from "@/lib/schema-converter";
import { Upload, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Schema } from "@shared/schema";
import { CodeEditor } from "@/components/code-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface SchemaCreatorProps {
  editId?: number;
  onComplete?: () => void;
}

export function SchemaCreator({ editId, onComplete }: SchemaCreatorProps) {
  const [typeScript, setTypeScript] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [labels, setLabels] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSchemas, setSelectedSchemas] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: schemas } = useQuery<Schema[]>({
    queryKey: ["/api/schemas"]
  });

  const { data: editSchema, isLoading: isLoadingSchema } = useQuery<Schema>({
    queryKey: [`/api/schemas/${editId}`],
    enabled: !!editId && !isNaN(editId),
  });

  useEffect(() => {
    // Only update state if we have the schema data and it's not loading
    if (editSchema && !isLoadingSchema) {
      setName(editSchema.name);
      setTypeScript(editSchema.typeScript);
      setCategory(editSchema.category || "");
      setLabels(editSchema.labels?.join(", ") || "");
      setDescription(editSchema.description || "");
    }
  }, [editSchema, isLoadingSchema]);

  const categories = schemas
    ? Array.from(new Set(schemas.map(s => s.category || "uncategorized")))
    : [];

  const createSchemaMutation = useMutation({
    mutationFn: async (jsonSchema: string) => {
      const endpoint = editId
        ? `/api/schemas/${editId}`
        : "/api/schemas";

      const method = editId ? "PUT" : "POST";

      return apiRequest(method, endpoint, {
        name,
        typeScript,
        jsonSchema,
        category,
        labels: labels.split(",").map(l => l.trim()).filter(Boolean),
        description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schemas"] });

      toast({
        title: "Success",
        description: editId ? "Schema updated successfully" : "Schema created successfully"
      });

      if (!editId) {
        setTypeScript("");
        setName("");
        setCategory("");
        setLabels("");
        setDescription("");
        setIsAddingNewCategory(false);
        setSelectedSchemas([]);
      }

      if (onComplete) {
        onComplete();
      }
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save schema",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTypeScript(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSchemaSelect = (schemaId: number) => {
    setSelectedSchemas(prev => {
      const isSelected = prev.includes(schemaId);
      if (isSelected) {
        return prev.filter(id => id !== schemaId);
      } else {
        return [...prev, schemaId];
      }
    });
  };

  const getCombinedInterface = () => {
    const selectedInterfaces = selectedSchemas
      .map(id => schemas?.find(s => s.id === id))
      .filter(Boolean)
      .map(schema => schema?.typeScript || "")
      .join("\n\n");

    return selectedInterfaces + (selectedInterfaces && typeScript ? "\n\n" : "") + typeScript;
  };

  const handleConvert = async () => {
    try {
      if (!name) {
        toast({
          title: "Error",
          description: "Please provide a name for the schema",
          variant: "destructive"
        });
        return;
      }

      const combinedTypeScript = getCombinedInterface();
      const jsonSchema = convertTypeScriptToJsonSchema(combinedTypeScript);

      await createSchemaMutation.mutateAsync(jsonSchema);
    } catch (err) {
      console.error('Conversion error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to convert schema",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {isLoadingSchema ? (
        <div>Loading schema...</div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Schema Name</Label>
            <Input
              id="name"
              placeholder="Schema name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {isAddingNewCategory ? (
              <div className="flex gap-2">
                <Input
                  id="category"
                  placeholder="Enter new category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsAddingNewCategory(false);
                    setCategory("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNewCategory(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="labels">Labels (comma-separated)</Label>
            <Input
              id="labels"
              placeholder="e.g., api, user, validation"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this schema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Include Existing Interfaces</Label>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {schemas?.map(schema => (
                    <div key={schema.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`schema-${schema.id}`}
                        checked={selectedSchemas.includes(schema.id)}
                        onCheckedChange={() => handleSchemaSelect(schema.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`schema-${schema.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {schema.name}
                        </label>
                        {schema.description && (
                          <p className="text-sm text-muted-foreground">
                            {schema.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 mb-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload TypeScript File
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".ts,.tsx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="space-y-2">
            <Label>Combined TypeScript Interface</Label>
            <div className="border rounded-md">
              <CodeEditor
                value={getCombinedInterface()}
                onChange={setTypeScript}
                language="typescript"
                height="300px"
              />
            </div>
          </div>

          <Button
            onClick={handleConvert}
            className="w-full"
            disabled={createSchemaMutation.isPending}
          >
            {editId ? "Save Schema" : "Convert to JSON Schema"}
          </Button>
        </>
      )}
    </div>
  );
}
