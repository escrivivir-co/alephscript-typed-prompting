import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type Schema, type Library } from "@shared/schema";
import { FileJson, Tag, CalendarDays, Code2, Library as LibraryIcon } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SchemaOverview() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("all");

  const { data: schemas } = useQuery<Schema[]>({
    queryKey: ["/api/schemas"]
  });

  const { data: libraries } = useQuery<Library[]>({
    queryKey: ["/api/libraries"]
  });

  const categories = schemas
    ? Array.from(new Set(schemas.map(s => s.category || "uncategorized")))
    : [];

  const filteredSchemas = schemas?.filter(schema => {
    const matchesCategory = categoryFilter === "all" || schema.category === categoryFilter;
    const matchesLibrary = selectedLibrary === "all" || schema.libraryId?.toString() === selectedLibrary;
    const matchesSearch = !searchTerm ||
      schema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.labels?.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch && matchesLibrary;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schema Overview</h1>
        <div className="flex gap-2">
          <Link href="/schema-creator">
            <Button>Create New Schema</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Schemas</TabsTrigger>
          <TabsTrigger value="libraries">Libraries</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category, index) => (
                  <SelectItem key={`category-${index}-${category}`} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by library" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Libraries</SelectItem>
                {libraries?.map((library) => (
                  <SelectItem key={library.id} value={library.id.toString()}>
                    {library.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemas?.map((schema, index) => (
              <SchemaCard key={`schema-${schema.id || index}`} schema={schema} libraries={libraries} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="libraries">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries?.map((library) => (
              <LibraryCard
                key={library.id}
                library={library}
                schemas={schemas?.filter(s => s.libraryId === library.id) || []}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SchemaCard({ schema, libraries }: { schema: Schema; libraries?: Library[] }) {
  const library = libraries?.find(l => l.id === schema.libraryId);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {schema.name}
          </CardTitle>
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="typescript">
              <AccordionTrigger className="text-sm">
                <Code2 className="h-4 w-4 mr-2" />
                TypeScript Interface
              </AccordionTrigger>
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
              <AccordionTrigger className="text-sm">
                <FileJson className="h-4 w-4 mr-2" />
                JSON Schema
              </AccordionTrigger>
              <AccordionContent>
                <div className="border rounded-md bg-muted/40">
                  <CodeEditor
                    value={schema.jsonSchema}
                    onChange={() => {}}
                    language="json"
                    height="200px"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-2">
            <Link href={`/validator?schemaId=${schema.id}`}>
              <Button variant="outline" className="w-full">
                Use Validator
              </Button>
            </Link>
            <Link href={`/schema-creator?edit=${schema.id}`}>
              <Button variant="outline" className="w-full">
                Edit Schema
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LibraryCard({ library, schemas }: { library: Library; schemas: Schema[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <LibraryIcon className="h-5 w-5" />
            {library.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {library.description && (
            <p className="text-sm text-muted-foreground">{library.description}</p>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-1" />
            {new Date(library.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {schemas.length} schema{schemas.length !== 1 ? 's' : ''}
          </div>
          <Link href={`/schema-creator?libraryId=${library.id}`}>
            <Button variant="outline" className="w-full">
              Add Schema to Library
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}