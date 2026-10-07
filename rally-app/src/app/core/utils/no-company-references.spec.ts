import * as fs from 'fs';
import * as path from 'path';

/**
 * Guardia: la aplicación (frontend y backend) no debe llevar referencias a la empresa.
 * El nombre se arma por partes para que este archivo no se cuente a sí mismo.
 */
const FORBIDDEN = new RegExp(['gen', 'tera'].join(''), 'i');
const REPO_ROOT = path.resolve(__dirname, '../../../../..'); // src/app/core/utils -> raíz del repositorio
const SKIP_DIRS = new Set(['node_modules', 'dist', '.angular', '.git', 'venv', '__pycache__', '.pytest_cache',
  '.scannerwork', 'coverage', '.gemini', 'migrations']);
const TEXT_EXTENSIONS = new Set(['.ts', '.html', '.scss', '.css', '.json', '.py', '.md', '.txt', '.yaml', '.yml',
  '.js', '.ps1', '.bat', '.example', '.properties', '.conf']);
const SKIP_FILES = new Set(['package-lock.json', 'rally_api_collection.json']);

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name)) && !SKIP_FILES.has(entry.name)) {
      yield path.join(dir, entry.name);
    }
  }
}

describe('no references to the company in the code', () => {
  const roots = ['rally-app/src', 'rally-app/config', 'rally-back'].map((p) => path.join(REPO_ROOT, p));

  it('finds the repository folders (so the guard is not silently empty)', () => {
    for (const root of roots) expect(fs.existsSync(root)).toBe(true);
    const files = roots.flatMap((root) => [...walk(root)]);
    expect(files.length).toBeGreaterThan(100);
  });

  it('has no text file mentioning the company', () => {
    const offenders = roots
      .flatMap((root) => [...walk(root)])
      .filter((file) => FORBIDDEN.test(fs.readFileSync(file, 'utf-8')))
      .map((file) => path.relative(REPO_ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('has no company logo among the image assets', () => {
    const images = fs.readdirSync(path.join(REPO_ROOT, 'rally-app/src/assets/imgs'));
    expect(images.filter((name) => /logo/i.test(name))).toEqual([]);
  });
});
