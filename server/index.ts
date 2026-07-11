import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { app, createApp } from './app';

export { app, createApp };
export * from './adapters';
export * from './dedupe';

const entryPoint = process.argv[1] ? resolve(process.argv[1]) : '';
const isMainModule = entryPoint === fileURLToPath(import.meta.url);

if (isMainModule) {
  const port = Number.parseInt(process.env.PORT ?? '8787', 10);
  const host = process.env.HOST ?? '127.0.0.1';
  app.listen(port, host, () => {
    process.stdout.write(`BearingScope API listening on http://${host}:${port}\n`);
  });
}
