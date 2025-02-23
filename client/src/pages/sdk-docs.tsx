import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Download, Book, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CodeEditor } from "@/components/code-editor";

export default function SDKDocs() {
  const [demoResponse, setDemoResponse] = useState<string>("");

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/client-package");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "validator-api-client.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download client package:", error);
    }
  };

  const handleRunDemo = async () => {
    try {
      // Example shop order data
      const demoData = {
        id: 1,
        customerId: 1001,
        products: [
          {
            productId: 1,
            quantity: 2,
            price: 999.99
          }
        ],
        total: 1999.98,
        status: "pending",
        shippingAddress: {
          street: "123 Demo St",
          city: "Example City",
          postalCode: "12345",
          country: "Demo Country"
        },
        createdAt: new Date().toISOString()
      };

      const response = await fetch("/api/validate/1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(demoData)
      });

      const result = await response.json();
      setDemoResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Failed to run demo:", error);
      setDemoResponse(JSON.stringify({ error: "Failed to run demo" }, null, 2));
    }
  };

  const handleOpenSwagger = () => {
    window.open('/api-docs', '_blank');
  };

  const handleOpenApiSpec = () => {
    window.open('/api-docs.json', '_blank');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6" />
          <h1 className="text-3xl font-bold">SDK Documentation</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenSwagger} className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Swagger UI
          </Button>
          <Button variant="outline" onClick={handleOpenApiSpec} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            OpenAPI JSON
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download SDK
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rest">
        <TabsList>
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="typescript">TypeScript SDK</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="rest">
          <Card>
            <CardHeader>
              <CardTitle>REST API Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our REST API is fully documented using OpenAPI/Swagger specification. 
                You can explore the API in two ways:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal underline"
                    onClick={handleOpenSwagger}
                  >
                    Use our interactive Swagger UI to explore and test the API endpoints
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal underline"
                    onClick={handleOpenApiSpec}
                  >
                    Download the OpenAPI specification to generate clients in your preferred language
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typescript">
          <Card>
            <CardHeader>
              <CardTitle>TypeScript SDK Packages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Installation</h3>
                <pre className="p-2 bg-muted rounded-md"><code>
                  npm install typescript-schema-validator-sdk
                </code></pre>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. Validation Package</h3>
                <pre className="p-2 bg-muted rounded-md"><code>{`import { ValidationClient } from '@typescript-schema-validator/validation';

const client = new ValidationClient('http://your-api-url');

// Validate JSON data against TypeScript interface
const report = await client.validate(
  \`interface Product { 
    id: number; 
    name: string; 
    price: number; 
  }\`,
  { 
    id: 1, 
    name: "Gaming Laptop", 
    price: 999.99 
  }
);

console.log(report.valid); // true`}</code></pre>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Schema Management</h3>
                <pre className="p-2 bg-muted rounded-md"><code>{`import { SchemaClient } from '@typescript-schema-validator/schema';

const client = new SchemaClient('http://your-api-url');

// Create a new schema
const schema = await client.createSchema({
  name: "Order Schema",
  typeScript: \`interface Order {
    id: number;
    customerId: number;
    products: {
      productId: number;
      quantity: number;
      price: number;
    }[];
    total: number;
    status: string;
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    createdAt: string;
  }\`
});`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Live Demo: Validate Shop Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to validate a sample shop order against our schema.
                This demonstrates how the validation API works with real data.
              </p>

              <Button onClick={handleRunDemo} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run Demo
              </Button>

              {demoResponse && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Validation Response:</h4>
                  <div className="border rounded-md bg-muted/40">
                    <CodeEditor
                      value={demoResponse}
                      language="json"
                      height="200px"
                      onChange={() => {}}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}