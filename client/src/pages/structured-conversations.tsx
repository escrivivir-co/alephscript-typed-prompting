import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationTree } from "@/components/conversation-tree";
import { RepositoryTree } from "@/components/repository-tree";
import { RepositorySearch } from "@/components/repository-search";
import { useLocation } from "wouter";
import { useState } from "react";

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  content?: any;
}

// Mock repository data for prompts
const mockPromptRepository: TreeNode[] = [
  {
    id: "prompt-root",
    name: "Prompts",
    type: "folder" as const,
    children: [
      {
        id: "prompt-schemas",
        name: "Schema Generation",
        type: "folder" as const,
        children: [
          {
            id: "prompt-user-schema",
            name: "User Schema.prompt",
            type: "file" as const,
            content: "Generate a JSON Schema for a User with:\n- Required username (string)\n- Email (string with email format)\n- Age (number, minimum 13)\n- Optional bio (string)"
          },
          {
            id: "prompt-product-schema",
            name: "Product Schema.prompt",
            type: "file" as const,
            content: "Create a JSON Schema for a Product with:\n- SKU (string pattern)\n- Name (string)\n- Price (number, minimum 0)\n- Categories (array of strings)\n- Stock level (integer, minimum 0)"
          }
        ]
      }
    ]
  }
];

export default function StructuredConversations() {
  const [selectedPromptNode, setSelectedPromptNode] = useState<TreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePromptNodeSelect = (node: TreeNode) => {
    setSelectedPromptNode(node);
    if (node.type === 'file' && node.content) {
      console.log('Selected prompt:', node.content);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Prompt Repository Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prompt Repository</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RepositorySearch 
              onSearch={setSearchQuery}
              placeholder="Search prompts..."
            />
            <div className="border rounded-lg p-4">
              <RepositoryTree
                data={mockPromptRepository}
                onSelect={handlePromptNodeSelect}
                selectedId={selectedPromptNode?.id}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Tree Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Structured Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationTree />
        </CardContent>
      </Card>
    </div>
  );
}