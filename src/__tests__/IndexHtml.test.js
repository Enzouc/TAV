import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('index.html', () => {
  const filePath = path.resolve(process.cwd(), 'index.html');
  it('existe en la raíz del proyecto', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });
  it('contiene el contenedor root y referencia a /src/main.jsx', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toMatch(/<div id="root"><\/div>/);
    expect(content).toMatch(/<script[^>]*type="module"[^>]*src="\/src\/main\.jsx"/);
  });
});
