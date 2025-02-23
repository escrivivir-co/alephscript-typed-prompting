import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type Library } from "@shared/schema";

interface LibrarySelectorProps {
  selectedLibrary: string;
  libraries?: Library[];
  schemas?: any[];
  selectedSchemas: number[];
  onLibrarySelect: (library: string) => void;
  onSchemaSelect: (schemaId: number) => void;
}

export function LibrarySelector({
  selectedLibrary,
  libraries,
  schemas,
  selectedSchemas,
  onLibrarySelect,
  onSchemaSelect
}: LibrarySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Library</label>
        <Select value={selectedLibrary} onValueChange={onLibrarySelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a library" />
          </SelectTrigger>
          <SelectContent>
            {libraries?.map((library) => (
              <SelectItem key={library.id} value={library.id.toString()}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedLibrary && (
        <div className="space-y-2">
          <Label>Include Library Interfaces</Label>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {schemas?.map((schema: any) => (
                  <div key={schema.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`schema-${schema.id}`}
                      checked={selectedSchemas.includes(schema.id)}
                      onCheckedChange={() => onSchemaSelect(schema.id)}
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
      )}
    </div>
  );
}
