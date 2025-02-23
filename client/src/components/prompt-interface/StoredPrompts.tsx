import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Save } from "lucide-react";
import { type StoredPrompt } from "./types";

interface StoredPromptsProps {
  storedPrompts?: StoredPrompt[];
  editingPromptId: number | null;
  onEdit: (prompt: StoredPrompt) => void;
  onDelete: (id: number) => void;
  onSave: () => void;
}

export function StoredPrompts({
  storedPrompts,
  editingPromptId,
  onEdit,
  onDelete,
  onSave
}: StoredPromptsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Conversation Prompts</CardTitle>
          <Button onClick={onSave} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            {editingPromptId ? 'Update Prompt' : 'Save Current Prompt'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!storedPrompts || storedPrompts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No stored prompts yet
            </p>
          ) : (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storedPrompts.map((stored) => (
                    <TableRow key={stored.id}>
                      <TableCell className="font-medium">{stored.name}</TableCell>
                      <TableCell className="max-w-[400px]">
                        <p className="truncate">{stored.content}</p>
                      </TableCell>
                      <TableCell>{stored.modelName}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(stored)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the prompt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(stored.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}