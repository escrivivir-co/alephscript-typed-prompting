# Integración con ALEPH Scriptorium

> **Submódulo**: `alephscript-typed-prompting`  
> **Orden**: #12 de 12 submódulos  
> **Rama de integración**: `integration/beta/scriptorium`  
> **Plugin ID**: `typed-prompting`

---

## Arquitectura del Submódulo

```
alephscript-typed-prompting/
├── client/                     # Frontend React + Vite
│   └── src/
│       ├── pages/              # 13 páginas de funcionalidad
│       │   ├── interface-to-schema.tsx    # TypeScript → JSON Schema
│       │   ├── prompt-to-interface.tsx    # Prompt → Interface
│       │   ├── prompt-with-schema.tsx     # Prompts tipados
│       │   ├── simple-message-validation.tsx  # Validador
│       │   ├── structured-conversations.tsx   # Conversaciones
│       │   ├── schema-creator.tsx         # Editor visual
│       │   ├── repository.tsx             # Bibliotecas
│       │   └── validator.tsx              # Validador avanzado
│       ├── components/         # Componentes UI (Radix + Tailwind)
│       └── hooks/              # Hooks personalizados
├── server/                     # Backend Express
│   ├── routes/                 # 8 endpoints API
│   │   ├── schema.routes.ts
│   │   ├── library.routes.ts
│   │   ├── validation.routes.ts
│   │   ├── stored-prompts.routes.ts
│   │   ├── ai-config.routes.ts
│   │   ├── converter.ts
│   │   └── interface-generation.routes.ts
│   ├── handlers/               # Lógica de negocio
│   ├── swagger.ts              # Documentación OpenAPI
│   └── storage.ts              # Persistencia (JSON o PostgreSQL)
├── shared/                     # Código compartido
│   └── schema.ts               # Definiciones TypeScript + Zod + Drizzle
├── data/                       # Datos de ejemplo
│   └── stored-prompts.json     # Schemas, prompts, configs de demo
└── README-SCRIPTORIUM.md       # Este archivo
```

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite + TypeScript |
| UI | Radix UI + Tailwind CSS + Lucide Icons |
| Editor | Monaco Editor (TypeScript) |
| Backend | Express + TypeScript |
| ORM | Drizzle ORM |
| DB | PostgreSQL (Neon) / JSON local |
| Validación | AJV (JSON Schema) + Zod |
| IA | OpenAI, DeepSeek, Ollama, Anthropic |
| API Docs | Swagger UI |

---

## Mapeo Ontológico con Scriptorium

| TypedPrompting | Scriptorium | Relación |
|----------------|-------------|----------|
| **Schema** | Contrato de comunicación | Los agentes validan mensajes con schemas |
| **Library** | Biblioteca de contratos | Agrupación por dominio (ARG, Teatro, Fundación) |
| **StoredPrompt** | Prompt tipado | Template reutilizable con validación |
| **ValidationHistory** | Log de auditoría | Registro de comunicaciones validadas |
| **AIConfig** | MCP Preset | Configuración de proveedor de IA |

### Mapeo con Banderas de Auditoría

| Bandera | Uso de TypedPrompting |
|---------|----------------------|
| @blueflag | Validar que respuestas cumplan schema (evidencia) |
| @blackflag | Detectar respuestas malformadas (captura) |
| @redflag | Verificar schemas de recursos materiales |
| @yellowflag | Alertar sobre límites de traducción NL↔JSON |
| @orangeflag | Validar registro de conversaciones |

---

## Modos de Operación

### Modo Asistente

Guía interactiva para diseñar ontologías:

| Handoff | Descripción |
|---------|-------------|
| Estudiar caso de uso | Analizar requisitos y sugerir estructura |
| Sugerir ontología | Buscar en bibliotecas y proponer schema |
| Importar ontología | Cargar schema desde archivo o URL |
| Crear schema visual | Abrir editor visual en navegador |

### Modo Gestor

Instalación de reglas en agentes y flujos:

| Handoff | Descripción |
|---------|-------------|
| Instalar en agente | Añadir validationSchema a receta |
| Instalar en flujo ARG | Definir protocolo de comunicación en obra |
| Exportar biblioteca | Generar paquete de schemas |
| Validar mensaje | Verificar mensaje contra schema |

---

## Integración con Plugins

### AGENT_CREATOR

Campo añadido a `recipe.json`:

```json
{
  "name": "mi-agente",
  "validationSchema": {
    "input": ["schema-pregunta-usuario"],
    "output": ["schema-respuesta-agente"],
    "mode": "strict"
  }
}
```

### ARG_BOARD

Campo añadido a `obras.json`:

```json
{
  "id": "mi-obra",
  "communicationProtocol": {
    "version": "1.0.0",
    "contracts": {
      "personaje1→personaje2": "schema-dialogo-formal",
      "usuario→personaje1": "schema-consulta"
    },
    "enforcement": "warn"
  }
}
```

### MCP_PRESETS

Los AIConfig de TypedPrompting se pueden sincronizar con presets MCP.

---

## Ejecución Local

### Requisitos

- Node.js 18+
- npm o yarn
- (Opcional) PostgreSQL / cuenta Neon

### Desarrollo

```bash
cd alephscript-typed-prompting

# Instalar dependencias
npm install

# Modo desarrollo (sin DB)
npm run dev

# Abrir en navegador
open http://localhost:5000
```

### Producción

```bash
npm run build
npm start
```

### Variables de Entorno

```env
# Opcional: PostgreSQL (si no, usa JSON local)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Opcional: API keys de IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## API REST

Documentación Swagger disponible en `/api-docs` cuando el servidor está corriendo.

### Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/schemas` | Listar todos los schemas |
| POST | `/api/schemas` | Crear nuevo schema |
| GET | `/api/libraries` | Listar bibliotecas |
| POST | `/api/validate` | Validar mensaje contra schema |
| POST | `/api/convert` | Convertir TypeScript a JSON Schema |
| GET | `/api/ai-configs` | Listar configuraciones de IA |

---

## Estructura de Datos

### Schema

```typescript
interface Schema {
  id: number;
  name: string;
  typeScript: string;      // Código TypeScript original
  jsonSchema: string;      // JSON Schema generado
  category: string;        // E-commerce, Scriptorium, etc.
  labels: string[];        // Tags para búsqueda
  description: string;
  libraryId: number | null;
  createdAt: string;
}
```

### Ejemplo de Schema

```json
{
  "id": 1,
  "name": "Consulta de Usuario",
  "typeScript": "interface ConsultaUsuario {\n  pregunta: string;\n  contexto?: string;\n  urgencia: 'baja' | 'media' | 'alta';\n}",
  "jsonSchema": "{\"type\":\"object\",\"properties\":{\"pregunta\":{\"type\":\"string\"},\"contexto\":{\"type\":\"string\"},\"urgencia\":{\"enum\":[\"baja\",\"media\",\"alta\"]}},\"required\":[\"pregunta\",\"urgencia\"]}",
  "category": "Scriptorium",
  "labels": ["usuario", "consulta", "agente"],
  "description": "Schema para validar consultas de usuarios a agentes",
  "libraryId": null
}
```

---

## Plugin en Scriptorium

### Ubicación

- **Código**: `.github/plugins/typed-prompting/`
- **Datos**: `ARCHIVO/PLUGINS/TYPED_PROMPTING/`
- **Bridge**: `.github/agents/plugin_ox_typedprompting.agent.md`

### Handoffs desde @aleph

```yaml
- label: "[TYPED-PROMPTING] Diseñar ontología"
  agent: plugin_ox_typedprompting
  prompt: Accede al plugin TypedPrompting. Modo Asistente para diseñar ontologías.

- label: "[TYPED-PROMPTING] Instalar reglas"
  agent: plugin_ox_typedprompting
  prompt: Accede al plugin TypedPrompting. Modo Gestor para instalar reglas en agentes o flujos.
```

---

## Changelog de Integración

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-24 | Añadir submódulo #12 | @aleph |
| 2025-12-24 | Crear rama integration/beta/scriptorium | @aleph |
| 2025-12-24 | Crear README-SCRIPTORIUM.md | @aleph |
