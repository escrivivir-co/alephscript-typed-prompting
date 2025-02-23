import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  content?: any;
}

interface TreeProps {
  data: TreeNode[];
  level?: number;
  onSelect?: (node: TreeNode) => void;
  selectedId?: string;
  searchQuery?: string;
}

// Helper function to check if a node matches the search query
function nodeMatchesSearch(node: TreeNode, searchQuery: string): boolean {
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();
  return (
    node.name.toLowerCase().includes(query) ||
    (node.type === 'file' && typeof node.content === 'string' && node.content.toLowerCase().includes(query))
  );
}

// Helper function to check if a node or its children match the search query
function hasMatchingNodes(node: TreeNode, searchQuery: string): boolean {
  if (nodeMatchesSearch(node, searchQuery)) return true;
  if (node.children) {
    return node.children.some(child => hasMatchingNodes(child, searchQuery));
  }
  return false;
}

export function RepositoryTree({ data, level = 0, onSelect, selectedId, searchQuery = '' }: TreeProps) {
  const filteredData = searchQuery
    ? data.filter(node => hasMatchingNodes(node, searchQuery))
    : data;

  return (
    <div className="pl-3">
      {filteredData.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={level}
          onSelect={onSelect}
          selectedId={selectedId}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}

function TreeItem({ node, level = 0, onSelect, selectedId, searchQuery = '' }: { node: TreeNode } & Omit<TreeProps, 'data'>) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isVisible = !searchQuery || hasMatchingNodes(node, searchQuery);
  const hasMatchingChildren = hasChildren && node.children!.some(child => hasMatchingNodes(child, searchQuery));

  if (!isVisible && !hasMatchingChildren) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-lg hover:bg-accent",
          selectedId === node.id && "bg-accent",
          searchQuery && nodeMatchesSearch(node, searchQuery) && "bg-yellow-100/50"
        )}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 p-0 hover:bg-transparent",
            !hasChildren && "invisible"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          className="h-8 justify-start gap-2 px-2 flex-1"
          onClick={() => onSelect?.(node)}
        >
          {node.type === 'folder' ? (
            <Folder className="h-4 w-4" />
          ) : (
            <File className="h-4 w-4" />
          )}
          <span className="truncate">{node.name}</span>
        </Button>
      </div>
      {hasChildren && isExpanded && node.children && (
        <RepositoryTree
          data={node.children}
          level={level + 1}
          onSelect={onSelect}
          selectedId={selectedId}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}