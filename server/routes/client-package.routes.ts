import { Router } from 'express';
import archiver from 'archiver';

const router = Router();

router.get("/", async (_req, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  res.attachment('validator-api-client.zip');
  archive.pipe(res);

  const clientFiles = {
    'README.md': `# TypeScript Schema Validator SDK

## Installation
\`\`\`bash
npm install typescript-schema-validator-sdk
\`\`\`

## Packages Overview:

This SDK is divided into three main packages:

### 1. Validation Package
For validating TypeScript interfaces and JSON data:
\`\`\`typescript
import { ValidationClient } from '@typescript-schema-validator/validation';

const client = new ValidationClient('http://your-api-url');
const report = await client.validate(typeScriptString, jsonData);
\`\`\`

### 2. Typing Package
For managing TypeScript interfaces and schema libraries:
\`\`\`typescript
import { TypingClient } from '@typescript-schema-validator/typing';

const client = new TypingClient('http://your-api-url');

// Create a library
const library = await client.createLibrary({
  name: "E-commerce Types",
  description: "Common interfaces for e-commerce"
});

// Create a schema
const schema = await client.createSchema({
  name: "Product",
  typeScript: \`interface Product { id: number; name: string; }\`,
  libraryId: library.id
});

// Create a typing prompt
const prompt = await client.createTypingPrompt({
  name: "Generate Product Interface",
  content: "Create a TypeScript interface for a product",
  modelId: 1,
  schemaId: schema.id
});
\`\`\`

### 3. Conversation Package
For managing conversation-based interface generation:
\`\`\`typescript
import { ConversationClient } from '@typescript-schema-validator/conversation';

const client = new ConversationClient('http://your-api-url');

// Create a conversation prompt
const prompt = await client.createConversationPrompt({
  name: "Product Schema Discussion",
  content: "Let's discuss the product interface structure",
  modelId: 1,
  schemaId: 1
});
\`\`\`

## Full Documentation
Visit our [API documentation](http://your-api-url/api-docs) for detailed information.
`,
    'packages/validation/index.ts': `import { ValidationReport } from '../../types';

export class ValidationClient {
  constructor(private baseUrl: string) {}

  async validate(typeScript: string, data: any): Promise<ValidationReport> {
    const response = await fetch(\`\${this.baseUrl}/api/validate\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typeScript, data })
    });

    if (!response.ok) {
      throw new Error('Validation failed');
    }

    return response.json();
  }
}`,
    'packages/typing/index.ts': `import { Schema, Library, StoredPrompt } from '../../types';
import { BaseClient } from '../base';

export class TypingClient extends BaseClient {
  // Schema Management
  async getSchemas(): Promise<Schema[]> {
    return this.request('/api/schemas');
  }

  async getSchema(id: number): Promise<Schema> {
    return this.request(\`/api/schemas/\${id}\`);
  }

  async createSchema(schema: Partial<Schema>): Promise<Schema> {
    return this.request('/api/schemas', {
      method: 'POST',
      body: JSON.stringify(schema)
    });
  }

  async updateSchema(id: number, schema: Partial<Schema>): Promise<Schema> {
    return this.request(\`/api/schemas/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(schema)
    });
  }

  async deleteSchema(id: number): Promise<void> {
    await this.request(\`/api/schemas/\${id}\`, {
      method: 'DELETE'
    });
  }

  // Library Management
  async getLibraries(): Promise<Library[]> {
    return this.request('/api/libraries');
  }

  async createLibrary(library: Partial<Library>): Promise<Library> {
    return this.request('/api/libraries', {
      method: 'POST',
      body: JSON.stringify(library)
    });
  }

  async updateLibrary(id: number, library: Partial<Library>): Promise<Library> {
    return this.request(\`/api/libraries/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(library)
    });
  }

  // Typing Prompts
  async getTypingPrompts(): Promise<StoredPrompt[]> {
    return this.request('/api/stored-prompts?type=typing');
  }

  async createTypingPrompt(prompt: Partial<StoredPrompt>): Promise<StoredPrompt> {
    return this.request('/api/stored-prompts', {
      method: 'POST',
      body: JSON.stringify({ ...prompt, type: 'typing' })
    });
  }

  async updateTypingPrompt(id: number, prompt: Partial<StoredPrompt>): Promise<StoredPrompt> {
    return this.request(\`/api/stored-prompts/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(prompt)
    });
  }

  async deleteTypingPrompt(id: number): Promise<void> {
    await this.request(\`/api/stored-prompts/\${id}\`, {
      method: 'DELETE'
    });
  }
}`,
    'packages/conversation/index.ts': `import { StoredPrompt } from '../../types';
import { BaseClient } from '../base';

export class ConversationClient extends BaseClient {
  async getConversationPrompts(): Promise<StoredPrompt[]> {
    return this.request('/api/stored-prompts?type=conversation');
  }

  async createConversationPrompt(prompt: Partial<StoredPrompt>): Promise<StoredPrompt> {
    return this.request('/api/stored-prompts', {
      method: 'POST',
      body: JSON.stringify({ ...prompt, type: 'conversation' })
    });
  }

  async updateConversationPrompt(id: number, prompt: Partial<StoredPrompt>): Promise<StoredPrompt> {
    return this.request(\`/api/stored-prompts/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(prompt)
    });
  }

  async deleteConversationPrompt(id: number): Promise<void> {
    await this.request(\`/api/stored-prompts/\${id}\`, {
      method: 'DELETE'
    });
  }

  async generateFromConversation(promptId: number, input: string): Promise<string> {
    const response = await fetch(
      \`\${this.baseUrl}/api/generate-from-conversation\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, input })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate from conversation');
    }

    return response.text();
  }
}`,
    'packages/base.ts': `export class BaseClient {
  constructor(protected baseUrl: string) {}

  protected async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(\`\${this.baseUrl}\${path}\`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(\`API request failed: \${response.statusText}\`);
    }

    return response.json();
  }
}`,
    'types.ts': `export interface Schema {
  id: number;
  name: string;
  typeScript: string;
  jsonSchema: string;
  category?: string;
  labels?: string[];
  description?: string;
  libraryId?: number;
  createdAt?: string;
}

export interface Library {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface StoredPrompt {
  id: number;
  name: string;
  content: string;
  modelId: number;
  schemaId: number;
  type: "typing" | "conversation";
  modelParams?: Record<string, any>;
  createdAt: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
}
`
  };

  // Add all files to the archive
  for (const [filename, content] of Object.entries(clientFiles)) {
    archive.append(content, { name: filename });
  }

  await archive.finalize();
});

export default router;
