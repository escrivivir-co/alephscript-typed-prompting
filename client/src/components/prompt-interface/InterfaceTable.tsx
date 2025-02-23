import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";
import { type GeneratedInterface } from "./types";

interface InterfaceTableProps {
  interfaces: GeneratedInterface[];
  onEdit: (id: string) => void;
  onSave: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function InterfaceTable({ interfaces, onEdit, onSave, onDelete, onAdd }: InterfaceTableProps) {
  const [selectedInterface, setSelectedInterface] = useState<GeneratedInterface | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interface Name</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interfaces.map((int) => (
              <TableRow key={int.name}>
                <TableCell className="font-medium">{int.name}</TableCell>
                <TableCell>
                  <code className="whitespace-pre-wrap line-clamp-2 text-sm">
                    {int.code}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(int.name)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(int.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedInterface(int);
                        setIsFullscreen(true);
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedInterface?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={selectedInterface?.code || ""}
              language="typescript"
              onChange={() => {}}
              height="100%"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Button onClick={onAdd} className="mt-4">
        Add Interface
      </Button>
    </>
  );
}
