import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface RepositorySearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function RepositorySearch({ onSearch, placeholder = "Search repositories..." }: RepositorySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder={placeholder}
        type="search"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
