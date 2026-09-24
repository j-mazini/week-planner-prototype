import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Generated artifacts only. Stop the local Next.js server before running.
for (const relativePath of ['.next', '.next-dev', 'node_modules/.cache', 'tsconfig.tsbuildinfo']) {
  const path = fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
  await rm(path, { recursive: true, force: true });
  console.log(`Removed cache: ${relativePath}`);
}
