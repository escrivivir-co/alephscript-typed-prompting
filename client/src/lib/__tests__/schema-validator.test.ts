import { convertTypeScriptToJsonSchema } from "../schema-converter";

describe("Schema Validator Test Suite", () => {
  const mockTypeScript = `
    export interface Casas {
      nombre: string;
    }
  `;

  const validJson = {
    nombre: "Casa2"
  };

  const invalidJson = {
    nombrde: "Casa2"
  };

  test("Convert TypeScript to JSON Schema", () => {
    const jsonSchema = convertTypeScriptToJsonSchema(mockTypeScript);
    const parsedSchema = JSON.parse(jsonSchema);
    
    expect(parsedSchema).toEqual({
      type: "object",
      properties: {
        nombre: {
          type: "string"
        }
      },
      required: ["nombre"]
    });
  });

  // API test functions to demonstrate usage
  async function createSchema(typeScript: string) {
    const response = await fetch("/api/schemas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "test-schema",
        typeScript,
        jsonSchema: convertTypeScriptToJsonSchema(typeScript)
      })
    });
    return response.json();
  }

  async function validateJson(schemaId: number, json: any) {
    const response = await fetch(`/api/validate/${schemaId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });
    return response.json();
  }

  // Example API usage:
  /*
  // Create schema
  const schema = await createSchema(mockTypeScript);
  
  // Test valid JSON
  const validResult = await validateJson(schema.id, validJson);
  // Expected: { valid: true, errors: [] }
  
  // Test invalid JSON
  const invalidResult = await validateJson(schema.id, invalidJson);
  // Expected: { 
  //   valid: false, 
  //   errors: [{ path: "", message: "must have required property 'nombre'" }] 
  // }
  */
});
