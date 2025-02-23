import fetch from "node-fetch";

async function testApi() {
    try {
        // 1. Create schema
        console.log("1. Creating schema...");
        const createResponse = await fetch(
            "http://localhost:5000/api/schemas",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "test-schema",
                    typeScript: `
          export interface Casas {
            nombre: string;
          }
        `,
                    jsonSchema: JSON.stringify({
                        type: "object",
                        properties: {
                            nombre: { type: "string" },
                        },
                        required: ["nombre"],
                    }),
                }),
            }
        );

        const schema: any = await createResponse.json();
        console.log("Schema created:", schema);

        // 2. Test valid JSON
        console.log("\n2. Testing valid JSON...");
        const validResponse = await fetch(
            `http://localhost:5000/api/validate/${schema.id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nombre: "Casa2" }),
            }
        );

        const validResult = await validResponse.json();
        console.log("Valid JSON result:", validResult);

        // 3. Test invalid JSON
        console.log("\n3. Testing invalid JSON...");
        const invalidResponse = await fetch(
            `http://localhost:5000/api/validate/${schema.id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nombrde: "Casa2" }),
            }
        );

        const invalidResult = await invalidResponse.json();
        console.log("Invalid JSON result:", invalidResult);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Run the test
testApi();
