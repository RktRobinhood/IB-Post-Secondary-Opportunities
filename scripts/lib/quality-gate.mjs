/** Offline release checks. CI runs this complete list; school edits may use data + targeted pages locally. */
export const CHECKS = [
  { id: 'scope', script: 'scripts/lib/check-scope-test.mjs', stage: 'data', title: 'Quick checks fall back safely for shared changes and CI' },
  { id: 'scaffold', script: 'scripts/lib/scaffold-test.mjs', stage: 'data', title: 'School drafts preserve unknowns and cannot overwrite records' },
  { id: 'schools', script: 'scripts/check-schools.mjs', stage: 'data', title: 'School schemas, identity and targeted handoffs' },
  { id: 'validate', script: 'scripts/validate.mjs', stage: 'data', title: 'Schemas, references, requirements and route integrity' },
  { id: 'eligibility', script: 'scripts/test-eligibility.mjs', stage: 'data', title: 'Eligibility, qualifications, conversion and honest unknowns' },
  { id: 'calendar', script: 'scripts/test-calendar.mjs', stage: 'data', title: 'Sourced dates, scoped events and deadline labels' },
  { id: 'sourcing', script: 'scripts/test-sourcing.mjs', stage: 'data', title: 'Facts retain source links and checked dates' },
  { id: 'studyinfo', script: 'scripts/test-studyinfo.mjs', stage: 'data', title: 'National catalogues preserve teaching language, qualification and intake' },
  { id: 'controls', script: 'scripts/test-controls.mjs', stage: 'data', title: 'Readable type and usable touch controls (until #80)' },
  { id: 'map', script: 'scripts/test-map.mjs', stage: 'data', title: 'Globe data and controls (until #79)' },
  { id: 'image-records', script: 'scripts/test-image-records.mjs', stage: 'data', title: 'Image records match their photographs and credits' },
  { id: 'images', script: 'scripts/test-images.mjs', stage: 'data', title: 'Published imagery and attribution (review workflow until #78)' },
  { id: 'build', script: 'src/build.mjs', stage: 'build', title: 'Build the complete site' },
  { id: 'check', script: 'scripts/check.mjs', stage: 'built', title: 'Page structure, internal links, metadata and local image files' },
  { id: 'school-pages', script: 'scripts/test-school-pages.mjs', stage: 'built', title: 'Country, school and programme facts, coverage and direct handoffs' },
  { id: 'templates', script: 'scripts/test-templates.mjs', stage: 'built', title: 'One template per country, university and programme level' },
  { id: 'ib-terms', script: 'scripts/test-requirement-translation.mjs', stage: 'built', title: 'Local requirements retain their IB translations' },
  { id: 'programme-images', script: 'scripts/test-programme-images.mjs', stage: 'built', title: 'Programme backdrops, credits and legible text' },
  { id: 'unique-images', script: 'scripts/test-unique-images.mjs', stage: 'built', title: 'Current image reuse protection (replaced in #78)' },
  { id: 'freshness', script: 'scripts/freshness.mjs', stage: 'built', title: 'Age of checked sources', advisory: true },
  { id: 'release', script: 'scripts/release-check.mjs', stage: 'built', title: 'Student-facing release safety and privacy' },
];

export const STAGES = ['data', 'build', 'built'];
// Network availability is reported separately rather than blocking an offline release.
export const NETWORK_CHECKS = [
  { command: 'npm run check:links', what: 'built outbound links (requires an existing build)' },
  { command: 'npm run refresh', what: 'annual source comparison is implemented in #76; currently a read-only rollover inventory' },
];
