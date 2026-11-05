import { cp, readFile, writeFile, rename, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
const root = process.cwd(),
  out = join(root, 'out'),
  temporary = join(root, '.hantu-export');
// Next's export is mounted as an independent adventure. The original game stays at /.
await rm(temporary, { recursive: true, force: true });
await rename(out, temporary);
await mkdir(out, { recursive: true });
await rename(temporary, join(out, 'hantu-codex'));
await cp(join(root, 'dist'), out, { recursive: true });
// Keep previous 3D assets in source history, outside the active pixel-art release.
for (const archived of ['models', 'sprites']) await rm(join(out, 'hantu-codex', archived), { recursive: true, force: true });
const original = await readFile(join(root, 'dist/index.html'), 'utf8');
const links =
  '<div class="hero-meta" aria-label="More adventures" style="flex-wrap:wrap;gap:8px"><a href="/hantu-codex/" style="color:#193e32;background:#faf7edf0;border:1px solid #193e3233;border-radius:4px;font-size:13px;padding:4px 10px;text-decoration:none;display:inline-flex;align-items:center;min-height:44px">Explore Hantu Codex ↗</a><i></i><a href="/hantu-codex/characters/" style="color:#193e32;background:#faf7edf0;border:1px solid #193e3233;border-radius:4px;font-size:13px;padding:4px 10px;text-decoration:none;display:inline-flex;align-items:center;min-height:44px">Meet the Hantu characters ↗</a></div>';
const marker = '<div class="hero-meta"><span>✧';
if (!original.includes(marker)) throw new Error('Original Lantern Keeper link anchor not found');
await writeFile(join(out, 'index.html'), original.replace(marker, links + marker));
console.log(
  'Preserved Lantern Keeper at /; added two links; Hantu Codex isolated at /hantu-codex/.',
);
