import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildOpenApiDocument, createApp } from './bootstrap';

async function exportDocument(): Promise<void> {
  const app = await createApp();
  await app.init();

  const target = resolve(process.cwd(), 'openapi.json');
  writeFileSync(target, JSON.stringify(buildOpenApiDocument(app), null, 2));

  await app.close();
  process.stdout.write(`OpenAPI document written to ${target}\n`);
}

void exportDocument();
