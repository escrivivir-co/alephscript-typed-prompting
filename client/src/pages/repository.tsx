import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type Schema, type Library } from "@shared/schema";
import { FileJson, Tag, CalendarDays, Code2, MessageSquare, Book, Library as LibraryIcon } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { RepositoryTree } from "@/components/repository-tree";
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

// Mock data for repositories
const mockData = {
  typescript: [
    {
      id: "ts-1",
      name: "Order Management",
      type: "folder" as const,
      children: [
        {
          id: "ts-2",
          name: "Order.ts",
          type: "file" as const,
          content: `interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

enum OrderStatus {
  Pending = "PENDING",
  Processing = "PROCESSING",
  Shipped = "SHIPPED",
  Delivered = "DELIVERED",
  Cancelled = "CANCELLED"
}`
        },
        {
          id: "ts-3",
          name: "Customer.ts",
          type: "file" as const,
          content: `interface Customer {
  id: string;
  name: string;
  email: string;
  address: Address;
  orders: Order[];
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}`
        }
      ]
    }
  ],
  jsonSchema: [
    {
      id: "json-1",
      name: "Schemas",
      type: "folder" as const,
      children: [
        {
          id: "json-2",
          name: "order.schema.json",
          type: "file" as const,
          content: `{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "customerName": { "type": "string" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "productId": { "type": "string" },
          "quantity": { "type": "number" },
          "price": { "type": "number" }
        },
        "required": ["productId", "quantity", "price"]
      }
    },
    "total": { "type": "number" },
    "status": {
      "type": "string",
      "enum": ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "customerName", "items", "total", "status", "createdAt"]
}`
        }
      ]
    }
  ],
  prompts: [
    {
      id: "prompt-1",
      name: "Order Prompts",
      type: "folder" as const,
      children: [
        {
          id: "prompt-2",
          name: "create-order.prompt",
          type: "file" as const,
          content: `Create an order with the following details:
- Customer: {customerName}
- Items: Array of products with quantities and prices
- Calculate total automatically
- Set initial status as PENDING
- Include timestamp

Validation:
- Customer name must be provided
- At least one item required
- Quantities must be positive numbers
- Prices must be positive numbers
- Total must match sum of item prices`
        }
      ]
    }
  ],
  conversations: [
    {
      id: "conv-1",
      name: "Order Processing",
      type: "folder" as const,
      children: [
        {
          id: "conv-2",
          name: "order-validation.conv",
          type: "file" as const,
          content: `Conversation flow for order validation:

1. User submits order details
2. System validates:
   - Customer exists
   - Products are in stock
   - Prices are current
   - Delivery address is valid
3. System confirms or rejects with specific reason
4. If confirmed, creates order and returns confirmation
5. If rejected, provides guidance for correction`
        }
      ]
    }
  ]
};

export default function Repository() {
  // Schema overview state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState<string>("all");

  // Repository tree state
  const [selectedTab, setSelectedTab] = useState("typescript");
  const [selectedNode, setSelectedNode] = useState<any>(null);

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
        <h1 className="text-3xl font-bold">Repository</h1>
        <div className="flex gap-2">
          <Link href="/schema-creator">
            <Button>Create New Schema</Button>
          </Link>
        </div>
      </div>

      {/* Schema Overview Section */}
      <div className="mb-8">
        <div className="flex gap-4 mb-6">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSchemas?.map((schema, index) => (
            <SchemaCard key={`schema-${schema.id || index}`} schema={schema} libraries={libraries} />
          ))}
        </div>
      </div>

      {/* Repository Tree Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="typescript" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                TS
              </TabsTrigger>
              <TabsTrigger value="jsonSchema" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Conv
              </TabsTrigger>
            </TabsList>

            <TabsContent value="typescript">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">TypeScript Interfaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <RepositoryTree
                    data={mockData.typescript}
                    onSelect={setSelectedNode}
                    selectedId={selectedNode?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jsonSchema">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">JSON Schemas</CardTitle>
                </CardHeader>
                <CardContent>
                  <RepositoryTree
                    data={mockData.jsonSchema}
                    onSelect={setSelectedNode}
                    selectedId={selectedNode?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prompts">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                  <RepositoryTree
                    data={mockData.prompts}
                    onSelect={setSelectedNode}
                    selectedId={selectedNode?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Structured Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <RepositoryTree
                    data={mockData.conversations}
                    onSelect={setSelectedNode}
                    selectedId={selectedNode?.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{selectedNode?.name || "Select a file to view"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode?.content ? (
                <CodeEditor
                  value={selectedNode.content}
                  language={
                    selectedTab === "typescript" ? "typescript" :
                    selectedTab === "jsonSchema" ? "json" :
                    "text"
                  }
                  onChange={() => {}}
                  height="600px"
                />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  Select a file from the repository to view its contents
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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