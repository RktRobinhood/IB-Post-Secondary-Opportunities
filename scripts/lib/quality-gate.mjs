/**
 * The authoritative list of checks a releasable build must pass.
 *
 * Before this file, the real interface was a set union spread across three
 * places that nobody could see at once: the `test` script in `package.json`,
 * the steps in `.github/workflows/deploy.yml`, and whatever `release-check.mjs`
 * happened to do. Each of the three was a hand-maintained list, and they had
 * drifted in *both* directions —
 *
 *   - `npm test` omitted the calendar, publication-floor, jurisdiction and
 *     release checks;
 *   - deploy CI omitted those four **and** the probe, sourcing, credential,
 *     map and imagery checks that `npm test` did run.
 *
 * So there were guards enforcing architectural decisions — that creating a
 * canonical Destination commits it to the publication floor, that the
 * Application Jurisdiction implementation stays country-agnostic — which
 * neither the default local command nor the deploy pipeline would have noticed
 * breaking. All of them passed when run by hand, which is why nothing had ever
 * drawn attention to it.
 *
 * The deletion test is the argument for a manifest rather than three lists:
 * removing a command entry silently removes its protection, and the removal
 * looks like tidying. Here, a check that is not in this array does not run, and
 * `scripts/test-quality-gate.mjs` fails if a `scripts/test-*.mjs` exists that
 * this array does not name — so adding a guard and forgetting to wire it up is
 * itself a failing test.
 *
 * ## Stages
 *
 * Order matters and the stages say why:
 *
 *   `data`  — reads `data/` and `src/lib/`. Fails before anything is built,
 *             because a data fault reported as a build fault wastes the reader's
 *             time looking in the wrong place.
 *   `build` — produces `dist/`.
 *   `built` — reads `dist/`. Cannot run before the build, by definition.
 *
 * ## What is deliberately not here
 *
 * Anything that needs the network. `check.mjs --external` and
 * `check-institution-links.mjs` open several hundred third-party URLs; a
 * release must not fail because a Danish university was rebooting, and a gate
 * that is red for reasons the author cannot fix teaches people to ignore it.
 * They are run on their own schedule, and `NETWORK_CHECKS` names them so the
 * exclusion is a decision on the record rather than an oversight.
 */

/** Checks that need the network, and therefore are not in the gate. */
export const NETWORK_CHECKS = [
  { command: 'npm run check:links', what: 'every outbound link on the built site' },
  { command: 'npm run check:institutions', what: "every institution's admissions URL" },
  { command: 'npm run verify', what: 're-reads each source and looks for the claim' },
];

/**
 * Every check, in the order it runs.
 *
 * `advisory` means a non-zero exit is reported and does not fail the gate. It
 * is for checks that report a state rather than assert one — freshness is a
 * fact about the data's age, not a fault.
 */
export const CHECKS = [
  // --- data ---------------------------------------------------------------
  {
    id: 'gate',
    script: 'scripts/test-quality-gate.mjs',
    stage: 'data',
    title: 'Every guard on disk is wired into this list, and CI runs this list',
  },
  {
    id: 'chars',
    script: 'scripts/test-no-control-chars.mjs',
    stage: 'data',
    title: 'No stray control characters in the records',
  },
  {
    id: 'validate',
    script: 'scripts/validate.mjs',
    stage: 'data',
    title: 'Records match their schemas, cross-references resolve, the graph is unique',
  },
  {
    id: 'canonical',
    script: 'scripts/test-canonical.mjs',
    stage: 'data',
    title: 'The canonical loader refuses a partial or overwritten graph',
  },
  {
    id: 'catalogue',
    script: 'scripts/test-catalogue.mjs',
    stage: 'data',
    title: 'Every Destination has exactly one identity',
  },
  {
    id: 'image-records',
    script: 'scripts/test-image-records.mjs',
    stage: 'data',
    title: 'Every image record names the photograph it actually holds',
  },
  {
    id: 'labels',
    script: 'scripts/test-deadline-labels.mjs',
    stage: 'data',
    title: "A calendar card's deadline label agrees with its own note",
  },
  {
    id: 'conversion',
    script: 'scripts/test-conversion-sync.mjs',
    stage: 'data',
    title: 'The conversion handbook and the Recognition Scheme agree row for row',
  },
  {
    id: 'eligibility',
    script: 'scripts/test-eligibility.mjs',
    stage: 'data',
    title: 'The eligibility scenarios, including the ones that assert a refusal',
  },
  {
    id: 'probes',
    script: 'scripts/test-probes.mjs',
    stage: 'data',
    title: 'A requirement can be looked for on the page that published it',
  },
  {
    id: 'attestation',
    script: 'scripts/test-attestation.mjs',
    stage: 'data',
    title: 'Only a person can have agreed with a record',
  },
  {
    id: 'sourcing',
    script: 'scripts/test-sourcing.mjs',
    stage: 'data',
    title: 'What a source is allowed to establish',
  },
  {
    id: 'credentials',
    script: 'scripts/test-credentials.mjs',
    stage: 'data',
    title: 'The Diploma and Course Results are read as different qualifications',
  },
  {
    id: 'ib-calendar',
    script: 'scripts/test-ib-calendar.mjs',
    stage: 'data',
    title: 'IB results day is stated once, and no record asserts it on its own authority',
  },
  {
    id: 'calendar',
    script: 'scripts/test-calendar.mjs',
    stage: 'data',
    title: 'The Application Milestone seam, and no event counted twice',
  },
  {
    id: 'jurisdictions',
    script: 'scripts/test-jurisdictions.mjs',
    stage: 'data',
    title: 'Application Jurisdictions stay country-agnostic',
  },
  {
    id: 'floor',
    script: 'scripts/test-floor.mjs',
    stage: 'data',
    title: 'Publishing a Destination commits it to the publication floor',
  },
  {
    id: 'controls',
    script: 'scripts/test-controls.mjs',
    stage: 'data',
    title: 'The touch minimum is declared once and no control opts out',
  },
  {
    id: 'destinations',
    script: 'scripts/test-destinations.mjs',
    stage: 'data',
    title: 'A non-Danish Institution does not render as a Danish one',
  },
  {
    id: 'audience',
    script: 'scripts/test-audience.mjs',
    stage: 'data',
    title: 'The reader is an EU/EEA student at a school in Denmark, not a citizen of it',
  },
  {
    id: 'evidence-policy',
    script: 'scripts/test-evidence-policy.mjs',
    stage: 'data',
    title: 'One Verification State means one thing in every output',
  },
  {
    id: 'map',
    script: 'scripts/test-map.mjs',
    stage: 'data',
    title: 'Every marker is where it says it is',
  },
  {
    id: 'images',
    script: 'scripts/test-images.mjs',
    stage: 'data',
    title: 'No published picture is an unreviewed machine pick below the floor',
  },
  {
    id: 'ib-statements',
    script: 'scripts/test-ib-statements.mjs',
    stage: 'data',
    title: 'An IB recognition statement is a touch and a link, never an import',
  },

  // --- build --------------------------------------------------------------
  {
    id: 'build',
    script: 'src/build.mjs',
    stage: 'build',
    title: 'Build the site',
  },

  // --- built --------------------------------------------------------------
  {
    id: 'check',
    script: 'scripts/check.mjs',
    stage: 'built',
    title: 'Every built page: structure, metadata, internal links',
  },
  {
    id: 'page-budget',
    script: 'scripts/test-page-budget.mjs',
    stage: 'built',
    title: 'A Destination page leads with its institutions and stays inside its word budget',
  },
  {
    id: 'ib-terms',
    script: 'scripts/test-requirement-translation.mjs',
    stage: 'built',
    title: 'No programme card or page shows a local-level requirement without its IB translation',
  },
  {
    id: 'freshness',
    script: 'scripts/freshness.mjs',
    stage: 'built',
    title: 'How old the evidence is',
    advisory: true,
  },
  {
    id: 'release',
    script: 'scripts/release-check.mjs',
    stage: 'built',
    title: 'Should a seventeen-year-old act on this',
  },
];

export const STAGES = ['data', 'build', 'built'];
