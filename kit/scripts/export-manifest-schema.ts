// Writes the project format for tools that don't import the kit's code (the Caption Studio's inspector, agents):
//   src/manifest/manifest.schema.json  — JSON Schema of a whole project (control hints kept as extra keywords)
//   src/manifest/components.json       — the component catalogue: type, label, category, description, default
//                                        length, default props, and each prop's control hints
// Run after changing the registry: npx tsx scripts/export-manifest-schema.ts
import fs from 'node:fs';
import { z } from 'zod';
import { REGISTRY } from '../src/manifest/registry';
import { manifestSchema, MANIFEST_VERSION } from '../src/manifest/schema';

const out = new URL('../src/manifest/', import.meta.url);
const schema = z.toJSONSchema(manifestSchema, { io: 'input', unrepresentable: 'any' });
fs.writeFileSync(new URL('manifest.schema.json', out), JSON.stringify({ $id: `wordlord-reel-manifest-v${MANIFEST_VERSION}`, ...schema }, null, 1));

const components = REGISTRY.map((e) => ({
  type: e.type,
  label: e.label,
  category: e.category,
  description: e.description,
  defaultDuration: e.defaultDuration,
  defaults: e.props.parse({}),
  props: z.toJSONSchema(e.props, { io: 'input', unrepresentable: 'any' }),
}));
fs.writeFileSync(new URL('components.json', out), JSON.stringify({ version: MANIFEST_VERSION, components }, null, 1));
console.log(`${components.length} components; schema ${(JSON.stringify(schema).length / 1024).toFixed(0)} KB`);
