# Graph-Based Knowledge System (Graphify)

ClinIQ includes a built-in, persistent **Graphify Knowledge Graph** stored in `graphify-out/`. Graphify performs abstract syntax tree (AST) structural analysis and community detection across the entire codebase.

---

## 1. Why Graphify in ClinIQ?

In complex healthcare codebases combining FHIR standards, multi-tenant databases, real-time telephony, and AI pipelines, understanding cross-package dependency chains and god nodes is critical:

- **Instant Architecture Navigation**: Discover how `apps/web` components depend on `@cliniq/fhir-core` and `@cliniq/db`.
- **Zero-Cost Structural Updates**: AST updates run in milliseconds without consuming LLM tokens.
- **Visual Exploration**: An interactive dependency map is rendered directly in `graphify-out/graph.html`.

---

## 2. Knowledge Graph Metrics

As of the latest synchronization:
- **Total Code Nodes**: 8,995 indexed symbols and modules.
- **Total Directed Edges**: 16,527 call, import, and type relationships.
- **Detected Communities**: 725 functional architectural clusters.

---

## 3. Knowledge Graph Artifacts (`graphify-out/`)

| Artifact | Location | Purpose |
| :--- | :--- | :--- |
| `graph.json` | `graphify-out/graph.json` | Raw JSON adjacency list and symbol graph for AI and CLI querying. |
| `graph.html` | `graphify-out/graph.html` | Visual, interactive 2D graph viewer with community clustering. |
| `GRAPH_REPORT.md` | `graphify-out/GRAPH_REPORT.md` | High-level summary of central god nodes and cross-community bridges. |

---

## 4. How to Query the Graph

You can query relationships and find execution paths using the `graphify` CLI:

### Query a Concept or Component:
```bash
# Query how call routing is implemented
graphify query "how does 3-tier call routing work"

# Explain a specific node or table
graphify explain "nurseAvailability"
```

### Find Shortest Dependency Path:
```bash
# Discover how the patient intake page connects to Medplum
graphify path "apps/web/src/app/patient/intake/page.tsx" "packages/fhir-core/src/client.ts"
```

### Keep Graph Synchronized:
Whenever you add or modify code files in the workspace, run:
```bash
graphify update .
```
This runs an instant AST update and refreshes `graphify-out/graph.json` and `graphify-out/graph.html`.
