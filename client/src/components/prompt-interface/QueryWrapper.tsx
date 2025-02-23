import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

interface QueryWrapperProps {
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  configureLink?: string;
  children: ReactNode;
}

export function QueryWrapper({
  isLoading,
  isEmpty,
  emptyMessage,
  configureLink,
  children
}: QueryWrapperProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (isEmpty) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-yellow-600">{emptyMessage}</p>
        {configureLink && (
          <Link href={configureLink}>
            <Button variant="outline" size="sm">Configure Now</Button>
          </Link>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
