import { createGenerator } from "ts-json-schema-generator";
import fs from "fs";
import os from "os";
import path from "path";

function generateSchema(
	filePath: string,
	tsconfigPath: string,
	rootType: string
): object {
	try {
		const config = {
			path: filePath, // archivo que contiene las interfaces
			tsconfig: tsconfigPath, // ruta al tsconfig.json
			type: rootType, // el tipo raíz a convertir, por ejemplo 'TypedMessage'
		};

		const generator = createGenerator(config);
		return generator.createSchema();
	} catch (error) {
		console.error("Error generating JSON Schema:");
		if (error instanceof Error) {
			console.error("Message:", error.message);
			console.error("Stack:", error.stack);
		} else {
			console.error("Unexpected error value:", error);
		}
		throw error;
	}
}

export function convertTypeScriptToJsonSchema(typeScript: string): string {
    try {
		const sanitizedTypeScript = typeScript
			.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "") // remove non-printable characters
			.replace(/[\r\n]+/g, " ")                   // replace newlines with a space
			.trim();
        const data = generateJSONSchemaFromTSInterfaces(sanitizedTypeScript);
        return JSON.stringify(data, null, 2);
    } catch (err: any) {
        console.error("Failed to parse TypeScript:", err.diagnostic.relatedInformation);
        throw new Error("Failed to parse TypeScript");
    }
}

// Test function to verify conversion
export function testConversion() {
    const testInterface = `
    export interface Casas {
      nombre: string;
    }
  `;

    const result = convertTypeScriptToJsonSchema(testInterface);
    console.log("Test conversion result:", result);
    return result;
}


export function generateJSONSchemaFromTSInterfaces(tsCode: string): object {
	// Write the provided TypeScript interfaces to a temporary file.
	const tempDir = os.tmpdir();
	const tempFile = path.join(tempDir, `temp-${Date.now()}.ts`);
	fs.writeFileSync(tempFile, tsCode, "utf8");

	// Extract the root type name from the file. Searches for an 'interface' or 'type' declaration.
	const interfaceMatch = tsCode.match(/interface\s+(\w+)/);
	const typeMatch = !interfaceMatch && tsCode.match(/type\s+(\w+)\s*=/);
	const rootType = interfaceMatch
		? interfaceMatch[1]
		: typeMatch
		? typeMatch[1]
		: "any";

	try {
		// Use the existing generateSchema function to build the JSON Schema.
		const schema = generateSchema(tempFile, "tsconfig.json", rootType);
		return schema;
	} finally {
		// Clean up the temporary file.
		fs.unlinkSync(tempFile);
	}
}