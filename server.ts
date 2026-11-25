import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveSafeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Never forward database connection strings or credentials to the client.
  // If a db.<project-ref>.supabase.co host was provided, derive only the public HTTPS API URL.
  const dbHostMatch = trimmed.match(/db\.([a-z0-9-]+)\.supabase\.co/i);
  if (dbHostMatch?.[1]) {
    return `https://${dbHostMatch[1]}.supabase.co`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    return '';
  }

  return '';
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');

  app.get('/api/supabase-config', (_req: Request, res: Response) => {
    const url = resolveSafeSupabaseUrl(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
    );
    const publishableKey = (
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      ''
    ).trim();

    res.setHeader('Cache-Control', 'no-store');
    res.json({
      url,
      publishableKey,
      configured: Boolean(url && publishableKey),
    });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Task Manager listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
