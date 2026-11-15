/** Exercise the quick-gate decision against a real, isolated Git history. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildBaseline, checkScope, schoolBuildBaseline } from './check-scope.mjs';

const WORKSPACE = path.resolve(import.meta.dirname, '..', '..');
const CACHE = path.join(WORKSPACE, '.cache');
await fs.mkdir(CACHE, { recursive: true });
const root = await fs.mkdtemp(path.join(CACHE, 'check-scope-'));
const dist = path.join(root, 'dist');
const marker = path.join(dist, '.build-info.json');
const git = (...args) => execFileSync('git', ['-c', 'commit.gpgSign=false', '-c', 'core.autocrlf=false', ...args], {
  cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});
const write = async (file, contents) => {
  const target = path.join(root, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, contents);
};
const scope = (options = {}) => checkScope({ root, dist, env: {}, ...options });
let checks = 0;
const expect = async (expected, message, options = {}) => {
  assert.equal(await scope(options), expected, message);
  checks++;
};

try {
  git('init', '--quiet');
  git('config', 'user.name', 'Gate regression fixture');
  git('config', 'user.email', 'gate-regression@example.invalid');
  await write('.gitignore', 'dist/\n');
  await write('data/schools/dk-one.json', '{}\n');
  await write('data/schools/dk-two.json', '{}\n');
  await write('data/countries/dk.json', '{}\n');
  await write('src/example.mjs', 'export const example = 1;\n');
  await write('src/pages/school.mjs', 'export const school = 1;\n');
  git('add', '.');
  git('commit', '--quiet', '-m', 'Full-build baseline');
  const revision = git('rev-parse', 'HEAD').trim();
  await fs.mkdir(dist);
  const cleanBaseline = await buildBaseline({ root, env: {} });
  assert.deepEqual(cleanBaseline.dirty, {}, 'A clean full build records an empty dirty-file snapshot.');
  const baseline = async (extra = {}) => fs.writeFile(marker, JSON.stringify({ ...cleanBaseline, ...extra }));
  const captureDirtyBaseline = async () => fs.writeFile(marker, JSON.stringify(await buildBaseline({ root, env: {} })));
  const captureSchoolBaseline = async (key = 'dk-one') => {
    const prior = JSON.parse(await fs.readFile(marker, 'utf8'));
    const next = await schoolBuildBaseline({ root, baseline: prior, key, env: {} });
    assert.ok(next, 'A school rebuild can advance a valid baseline.');
    await fs.writeFile(marker, JSON.stringify(next));
  };
  const reset = async () => {
    git('reset', '--hard', '--quiet', revision);
    await fs.rm(path.join(root, 'data', 'schools', 'dk-new.json'), { force: true });
    await baseline();
  };
  const changeSchool = () => write('data/schools/dk-one.json', '{"changed":true}\n');

  await baseline();
  await expect(null, 'A clean checkout has no school-only change.');
  await changeSchool();
  await expect('dk-one', 'An unstaged school change uses the quick gate.');
  git('add', 'data/schools/dk-one.json');
  await expect('dk-one', 'A staged school change uses the quick gate.');
  await write('data/schools/dk-one.json', '{"changed":"again"}\n');
  await expect('dk-one', 'Staged and unstaged changes to one file count once.');
  git('add', 'data/schools/dk-one.json');
  git('commit', '--quiet', '-m', 'One school since baseline');
  await expect('dk-one', 'A committed school change since the full build stays narrow.');

  await reset();
  await write('data/schools/dk-new.json', '{}\n');
  await expect('dk-new', 'An untracked school draft is included in scope detection.');
  await reset();
  await write('src/example.mjs', 'export const example = 2;\n');
  await expect(null, 'Code changes require the full gate.');
  await reset();
  await write('data/countries/dk.json', '{"shared":true}\n');
  await expect(null, 'Shared country data requires the full gate.');
  await reset();
  await changeSchool();
  await write('data/schools/dk-two.json', '{"changed":true}\n');
  await expect(null, 'Two schools require the full gate.');
  await reset();
  await changeSchool();
  await write('src/example.mjs', 'export const example = 3;\n');
  await expect(null, 'A school plus code requires the full gate.');

  await reset();
  await changeSchool();
  await expect(null, 'CI always runs the full gate.', { env: { CI: 'true' } });
  await expect(null, 'A truthy CI value always runs the full gate.', { env: { CI: '1' } });
  await expect('dk-one', 'Explicit CI=false permits the quick gate.', { env: { CI: 'false' } });
  await expect(null, '--full always runs the full gate.', { full: true });

  await fs.unlink(marker);
  await expect(null, 'A missing full-build marker requires the full gate.');
  await fs.writeFile(marker, '{');
  await expect(null, 'Malformed marker JSON requires the full gate.');
  await fs.writeFile(marker, 'null');
  await expect(null, 'A null marker requires the full gate without throwing.');
  await baseline({ revision: '' });
  await expect(null, 'A missing baseline revision requires the full gate.');
  await baseline({ revision: 'not-a-real-commit' });
  await expect(null, 'An invalid Git revision requires the full gate.');
  await baseline({ revision: '0'.repeat(40) });
  await expect(null, 'A well-formed revision missing from Git history requires the full gate.');
  await baseline();
  await expect(null, 'A changed SITE_BASE invalidates the full-build baseline.', { env: { SITE_BASE: '/project' } });
  await expect(null, 'A changed SITE_ORIGIN invalidates the full-build baseline.', { env: { SITE_ORIGIN: 'https://example.test' } });
  await baseline({ base: '/project', origin: 'https://example.test' });
  await expect('dk-one', 'Matching deployment settings allow the quick gate; trailing base slash is normalized.', {
    env: { SITE_BASE: '/project/', SITE_ORIGIN: 'https://example.test' },
  });

  await baseline({ dirty: undefined });
  await expect(null, 'An old marker without a dirty-file snapshot requires the full gate.');

  await reset();
  await changeSchool();
  await captureDirtyBaseline();
  git('restore', '--source', revision, '--worktree', 'data/schools/dk-one.json');
  await write('data/schools/dk-two.json', '{"changed":true}\n');
  await expect(null, 'Restoring school A after a dirty full build, then editing B, changes two built schools.');

  await reset();
  await write('src/pages/school.mjs', 'export const school = 2;\n');
  await captureDirtyBaseline();
  git('restore', '--source', revision, '--worktree', 'src/pages/school.mjs');
  await write('data/schools/dk-two.json', '{"changed":true}\n');
  await expect(null, 'Restoring a template captured by a dirty full build requires the full gate.');

  await reset();
  await changeSchool();
  await captureDirtyBaseline();
  await write('data/schools/dk-one.json', '{"changed":"after full build"}\n');
  await expect('dk-one', 'Editing only the same school captured by a dirty full build stays narrow.');

  await reset();
  await write('src/example.mjs', 'export const example = 2;\n');
  await captureDirtyBaseline();
  await changeSchool();
  await expect('dk-one', 'Unchanged dirty code already captured by the full build does not widen a later school edit.');

  await reset();
  await changeSchool();
  await captureSchoolBaseline();
  git('restore', '--source', revision, '--worktree', 'data/schools/dk-one.json');
  await write('data/schools/dk-two.json', '{"changed":true}\n');
  await expect(null, 'Restoring rebuilt A and editing B changes two schools relative to the generated output.');

  await reset();
  await changeSchool();
  await captureSchoolBaseline();
  await write('data/schools/dk-two.json', '{"changed":true}\n');
  await expect('dk-two', 'Unchanged rebuilt A permits a later quick rebuild of B.');

  await reset();
  await changeSchool();
  await captureSchoolBaseline();
  await write('data/schools/dk-one.json', '{"changed":"after quick build"}\n');
  await expect('dk-one', 'A further edit to rebuilt A stays scoped to A.');

  for (const [candidate, env, message] of [
    [null, {}, 'Missing metadata cannot advance a school baseline.'],
    [{ ...cleanBaseline, dirty: undefined }, {}, 'Old metadata without a dirty snapshot cannot advance.'],
    [cleanBaseline, { SITE_BASE: '/different' }, 'A changed base cannot advance a school baseline.'],
    [cleanBaseline, { SITE_ORIGIN: 'https://different.test' }, 'A changed origin cannot advance a school baseline.'],
  ]) {
    assert.equal(await schoolBuildBaseline({ root, baseline: candidate, key: 'dk-one', env }), null, message);
    checks++;
  }
} finally {
  // Verify the absolute real target before recursively deleting this fixture.
  const target = await fs.realpath(root);
  const workspace = await fs.realpath(WORKSPACE);
  const relative = path.relative(workspace, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || !relative.startsWith(`.cache${path.sep}check-scope-`)) {
    throw new Error(`Refusing fixture cleanup outside the workspace cache: ${target}`);
  }
  await fs.rm(target, { recursive: true, force: true });
}
console.log(`Gate scope: ${checks} Git, baseline and deployment-setting regressions pass.`);
