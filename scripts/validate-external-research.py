"""Read-only schema and internal consistency checks for external research packs.

Usage: python scripts/validate-external-research.py <file-or-directory> [...]
Requires jsonschema. Does not fetch URLs or establish source accuracy.
"""
import argparse
import datetime as dt
import json
from pathlib import Path
import re
import sys

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    raise SystemExit('This checker requires the Python jsonschema package.')

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / 'docs/research/external'
SCHEMA = json.loads((DIRECTORY / 'research-pack.schema.json').read_text(encoding='utf-8'))
Draft202012Validator.check_schema(SCHEMA)
VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FormatChecker())
OFFICIAL = {'official_institution', 'official_portal', 'government', 'qualification_body'}
EVIDENCED = {'supported', 'historical', 'unpublished', 'conflict', 'inferred'}
FACTUAL = {'supported', 'historical', 'conflict', 'inferred'}
INSTITUTION_TOPICS = {'identity', 'scope', 'ib_diploma', 'ib_course_results', 'english', 'application', 'dates', 'tuition', 'funding'}
PROGRAMME_TOPICS = {'programme', 'description', 'eligibility', 'subjects', 'selection', 'dates', 'tuition', 'places', 'cutoff'}


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError(f'Duplicate JSON property: {key}')
        value[key] = item
    return value


def read_pack(file):
    return json.loads(file.read_text(encoding='utf-8-sig'), object_pairs_hook=unique_object,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError(f'Invalid JSON constant {value}')))


def resolve_pointer(pack, pointer):
    node = pack
    for part in pointer[1:].split('/'):
        if re.search(r'~(?![01])', part):
            raise ValueError('Invalid JSON Pointer escape')
        part = part.replace('~1', '/').replace('~0', '~')
        if isinstance(node, list):
            if not re.fullmatch(r'0|[1-9][0-9]*', part):
                raise ValueError('Invalid array index')
            node = node[int(part)]
        else:
            node = node[part]
    return node


def inspect_pack(pack, assignment=None):
    errors = [f'{"/".join(map(str, e.absolute_path)) or "/"}: {e.message}'
              for e in sorted(VALIDATOR.iter_errors(pack), key=lambda e: str(list(e.absolute_path)))]
    warnings = []
    if errors:
        return errors, warnings
    if not pack['institution_key'].startswith(pack['country_code'] + '-'):
        errors.append('Institution key and country code differ')
    programmes = pack['programmes']
    entities = ['institution'] + [p['id'] for p in programmes + pack['faculties']]
    if len(set(entities)) != len(entities):
        errors.append('Programme and faculty entity IDs must be unique and cannot be institution')
    source_ids = [s['id'] for s in pack['sources']]
    claim_ids = [c['id'] for c in pack['claims']]
    for label, ids in [('Source', source_ids), ('Claim', claim_ids), ('Conflict', [c['id'] for c in pack['conflicts']])]:
        if len(set(ids)) != len(ids):
            errors.append(f'{label} IDs are not unique')
    sources = {s['id']: s for s in pack['sources']}
    claims = {c['id']: c for c in pack['claims']}
    if len(set(s['url'] for s in sources.values())) != len(sources):
        errors.append('Duplicate source URLs; reuse source IDs')
    for s in sources.values():
        if s['accessed_on'] > pack['research_date']:
            errors.append(f'{s["id"]}: source accessed after research_date')
        if s['saved_copy']:
            warnings.append(f'{s["id"]}: saved material/hash needs separate file verification')
    quoted_words = {}
    covered = []
    programme_ids = {p['id'] for p in programmes}
    for c in pack['claims']:
        cid = c['id']
        if c['entity_id'] not in entities:
            errors.append(f'{cid}: unknown entity {c["entity_id"]}')
        for pid in c['applies_to']['programme_ids']:
            if pid not in programme_ids:
                errors.append(f'{cid}: unknown applicable programme {pid}')
        if c['status'] == 'inferred' and c['topic'] != 'description':
            errors.append(f'{cid}: inference is allowed only for descriptions')
        if c['status'] in {'historical', 'conflict', 'inferred'}:
            warnings.append(f'{cid}: {c["status"]} claim requires editorial review')
        for e in c['evidence']:
            s = sources.get(e['source_id'])
            if not s:
                errors.append(f'{cid}: missing source {e["source_id"]}')
                continue
            quoted_words[s['id']] = quoted_words.get(s['id'], 0) + len((e['excerpt'] or '').split())
            if c['status'] in EVIDENCED and s['access'] != 'read':
                errors.append(f'{cid}: cited evidence source {s["id"]} was not read')
            if c['status'] in EVIDENCED and c['status'] != 'inferred' and s['kind'] not in OFFICIAL:
                errors.append(f'{cid}: factual evidence must be official ({s["id"]})')
        for pointer in c['supports_paths']:
            if c['status'] == 'inferred' and not re.fullmatch(r'/programmes/(0|[1-9][0-9]*)/(about|overview)', pointer):
                errors.append(f'{cid}: inferred evidence can support only a programme description field')
            try:
                resolve_pointer(pack, pointer)
            except (KeyError, IndexError, ValueError, TypeError):
                errors.append(f'{cid}: unresolved JSON Pointer {pointer}')
                continue
            if c['status'] not in FACTUAL or not c['evidence']:
                errors.append(f'{cid}: {c["status"]} cannot establish factual field {pointer}')
                continue
            covered.append(pointer)
        if c['topic'] not in {'identity', 'scope', 'description', 'programme', 'faculty', 'flagship'}:
            if c['status'] in FACTUAL and not c['applies_to']['intake']:
                errors.append(f'{cid}: consequential claim has no applicability period')
        if c['status'] == 'supported' and c['applies_to']['intake'] and '2027' not in c['applies_to']['intake']:
            warnings.append(f'{cid}: supported claim is not explicitly for 2027; check historical status')
        value = c['value']
        if c['topic'] == 'dates' and c['status'] in {'supported', 'historical'} and value is None:
            errors.append(f'{cid}: date claims need structured value')
        if value is not None:
            required = set()
            if c['topic'] == 'dates':
                required = {'event', 'date', 'time', 'timezone', 'round', 'date_kind', 'consequence'}
                for key in ['date', 'end_date']:
                    if value.get(key) is not None:
                        try:
                            dt.date.fromisoformat(value[key])
                        except (ValueError, TypeError):
                            errors.append(f'{cid}: invalid {key}')
                if value.get('date') is None and not value.get('date_text'):
                    errors.append(f'{cid}: undated milestone needs date_text')
            elif c['topic'] == 'tuition':
                required = {'amount', 'currency', 'basis', 'academic_year', 'fee_group', 'mandatory_fees_included', 'conditions'}
                if value.get('amount') is not None and (type(value['amount']) not in (int, float) or value['amount'] < 0):
                    errors.append(f'{cid}: fee amount must be a nonnegative number or null')
            elif c['topic'] == 'places':
                required = {'places', 'intake', 'quota', 'round'}
                if value.get('places') is not None and (type(value['places']) is not int or value['places'] < 0):
                    errors.append(f'{cid}: places must be a nonnegative integer or null')
            elif c['topic'] == 'cutoff':
                required = {'score', 'scale', 'intake', 'quota', 'round'}
            elif 'minimum_total' in value:
                required = {'minimum_total', 'out_of', 'includes_core', 'minimum_hl_total', 'threshold_kind'}
            elif c['topic'] == 'subjects' and 'requirements' in value:
                required = {'original_rule', 'requirements', 'conversion_source_ids'}
                for sid in value.get('conversion_source_ids', []):
                    if sid not in sources or sources[sid]['kind'] not in OFFICIAL or sources[sid]['access'] != 'read':
                        errors.append(f'{cid}: conversion source {sid} is missing, unread or nonofficial')
            if required - value.keys():
                errors.append(f'{cid}: structured value missing {sorted(required - value.keys())}')
    for sid, count in quoted_words.items():
        if count > 25:
            warnings.append(f'{sid}: {count} quoted words; check quotation budget')
    for gap in pack['gaps']:
        if gap['entity_id'] not in entities:
            errors.append(f'Gap has unknown entity {gap["entity_id"]}')
        for sid in gap['attempted_source_ids']:
            if sid not in sources:
                errors.append(f'Gap refers to missing source {sid}')
        warnings.append(f'Unresolved {gap["entity_id"]}/{gap["topic"]}: {gap["status"]}')
        if not gap['attempted_source_ids'] and not gap['searches'] and gap['status'] != 'not_applicable':
            warnings.append(f'Gap {gap["topic"]} has no recorded search/access attempt')
    conflict_claims = set()
    for conflict in pack['conflicts']:
        for cid in conflict['claim_ids']:
            conflict_claims.add(cid)
            if cid not in claims:
                errors.append(f'Conflict refers to unknown claim {cid}')
            elif claims[cid]['status'] != 'conflict':
                errors.append(f'{cid}: claim in a conflict must have conflict status')
    for c in pack['claims']:
        if c['status'] == 'conflict' and c['id'] not in conflict_claims:
            errors.append(f'{c["id"]}: conflict status has no conflict record')

    def is_covered(pointer):
        return any(pointer == base or pointer.startswith(base + '/') for base in covered)

    fields = []
    for key, value in pack['institution'].items():
        if value is not None:
            fields.append('/institution/' + key)
    if pack['coverage']['scope'] != 'undetermined':
        fields.append('/coverage/scope')
    if pack['coverage']['programme_list_complete']:
        fields.append('/coverage/programme_list_complete')
    for collection in ['programmes', 'faculties']:
        for index, entity in enumerate(pack[collection]):
            for key, value in entity.items():
                if key not in {'id', 'existing_name'} and value is not None:
                    fields.append(f'/{collection}/{index}/{key}')
    for pointer in fields:
        if not is_covered(pointer):
            errors.append(f'Factual field has no evidence claim: {pointer}')
    scope = pack['coverage']['scope']
    if scope == 'none' and programmes:
        errors.append('scope none must have no programmes')
    if scope != 'listed' and pack['coverage']['programme_list_complete']:
        errors.append('Only listed scope can claim an exhaustive programme list')
    if scope == 'listed' and pack['coverage']['programme_list_complete'] and not programmes:
        errors.append('Complete listed scope has no programmes')

    addressed = {(x['entity_id'], x['topic']) for x in pack['claims'] + pack['gaps']}
    if pack['assignment']['mode'] == 'full':
        for topic in sorted(INSTITUTION_TOPICS):
            if ('institution', topic) not in addressed:
                errors.append(f'Full research has no answer or gap for institution/{topic}')
        for p in programmes:
            for topic in sorted(PROGRAMME_TOPICS | ({'flagship'} if scope == 'catalogue' else set())):
                if (p['id'], topic) not in addressed:
                    errors.append(f'Full research has no answer or gap for {p["id"]}/{topic}')
        if scope == 'catalogue' and len(programmes) < 2 and ('institution', 'flagship') not in addressed:
            errors.append('Catalogue research needs flagships or an explicit flagship gap')
        if scope == 'catalogue' and not pack['faculties'] and ('institution', 'faculty') not in addressed:
            errors.append('Catalogue research needs faculty guidance or an explicit faculty gap')
        for faculty in pack['faculties']:
            if (faculty['id'], 'faculty') not in addressed:
                errors.append(f'No faculty claim or gap for {faculty["id"]}')
    if assignment:
        if pack['institution_name'] != assignment['name']:
            errors.append('institution_name does not echo the assignment name')
        if pack['assignment']['mode'] != assignment['mode'] or set(pack['assignment']['gaps']) != set(assignment['gaps']):
            errors.append('Returned assignment mode/gaps differ from the queue')
        gap_topics = {'flagships': 'flagship', 'faculties': 'faculty', 'programme-list': 'scope',
                      'ib-diploma': 'ib_diploma', 'sources': 'identity', 'programme-detail': 'selection', 'overviews': 'description'}
        for requested in assignment['gaps']:
            topic = gap_topics.get(requested)
            if topic and not any(t == topic for _, t in addressed):
                errors.append(f'Requested gap {requested} has no answer or unresolved gap')
        remaining = list(programmes)
        for target in assignment['targets']:
            match = next((p for p in remaining if (p['existing_name'] or p['name']) == target['name']
                          and (not target.get('campus') or p['campus'] == target['campus'])
                          and (not target.get('credential') or p['credential'] == target['credential'])), None)
            if match:
                remaining.remove(match)
                if 'overviews' in assignment['gaps'] and not match['overview'] and (match['id'], 'description') not in addressed:
                    errors.append(f'Target has no overview or description gap: {target["name"]}')
            elif ('institution', 'description') in {(g['entity_id'], g['topic']) for g in pack['gaps']}:
                warnings.append(f'Check institution-level gap explicitly names omitted target: {target["name"]}')
            else:
                errors.append(f'Missing targeted programme: {target["name"]}')
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('paths', nargs='+', type=Path)
    args = parser.parse_args()
    audit_file = DIRECTORY / 'audit.json'
    assignments = {a['institution_key']: a for a in json.loads(audit_file.read_text(encoding='utf-8'))['assignments']} if audit_file.exists() else {}
    files = set()
    failed = 0
    for entry in args.paths:
        if entry.is_dir():
            found = list(entry.rglob('*.research.json'))
            if not found:
                print(f'ERROR: no *.research.json files in {entry}')
                failed += 1
            files.update(found)
        elif entry.is_file():
            files.add(entry)
        else:
            print(f'ERROR: path not found: {entry}')
            failed += 1
    seen = {}
    for file in sorted(files):
        try:
            pack = read_pack(file)
            assignment = assignments.get(pack.get('institution_key')) if isinstance(pack, dict) else None
            errors, warnings = inspect_pack(pack, assignment)
            if isinstance(pack, dict) and isinstance(pack.get('institution_key'), str):
                key = pack['institution_key']
                if file.name != f'{key}.research.json':
                    errors.append(f'Filename must be {key}.research.json')
                if key in seen:
                    errors.append(f'Duplicate institution submission also found in {seen[key]}')
                seen[key] = file
                if key not in assignments:
                    warnings.append('Institution is not in the current queue; manually compare its assignment')
        except (OSError, ValueError, TypeError) as exc:
            errors, warnings = [str(exc)], []
        print(f'{file.name}: {"FAIL" if errors else "PASS structure and internal consistency"}')
        for error in errors:
            print(f'  ERROR: {error}')
        for warning in warnings:
            print(f'  REVIEW: {warning}')
        if errors:
            failed += 1
    print(f'{len(files)} file(s) checked; {failed} failure(s). Source accuracy is not checked.')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
