import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/code-editor";
import { Plus, Edit, Trash2 } from "lucide-react";
import { type GeneratedInterface } from "./types";

interface InterfaceViewerProps {
  interfaces: GeneratedInterface[];
  onEdit: (id: string) => void;
  onSave: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function InterfaceViewer({
  interfaces,
  onEdit,
  onSave,
  onDelete,
  onAdd
}: InterfaceViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Generated Interfaces</h3>
        <Button onClick={onAdd} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Interface
        </Button>
      </div>

      {interfaces.map((int) => (
        <Card key={int.name}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">{int.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => int.isEditing ? onSave(int.name, int.code) : onEdit(int.name)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(int.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={int.code}
              language="typescript"
              onChange={(value) => {
                if (int.isEditing) {
                  onSave(int.name, value || "");
                }
              }}
              height="200px"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
