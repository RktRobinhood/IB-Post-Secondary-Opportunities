/**
 * A small JSON Schema validator, covering exactly the subset our schemas use.
 *
 * Why not a library: this project has no dependencies by design, the schemas are
 * ours, and the error messages matter more than completeness. A student-facing
 * dataset needs to fail with "data/opportunities/x.json → requirements[2].level:
 * expected one of A, B, C — got 'HL'", not a stack trace.
 *
 * Supported: type (including unions), required, properties, additionalProperties,
 * items, minItems, enum, const, pattern, minLength, maxLength, minimum, maximum,
 * $ref (local and cross-file), $defs, oneOf, anyOf.
 */

export class SchemaSet {
  constructor() {
    this.schemas = new Map();
  }

  add(id, schema) {
    this.schemas.set(id, schema);
  }

  /** Resolve "common.schema.json#/$defs/id" or "#/$defs/requirement". */
  resolve(ref, currentId) {
    const [file, pointer] = ref.split('#');
    const schema = this.schemas.get(file || currentId);
    if (!schema) throw new Error(`unknown schema "${file || currentId}" referenced as ${ref}`);
    if (!pointer || pointer === '/') return { schema, id: file || currentId };

    let node = schema;
    for (const partRaw of pointer.split('/').filter(Boolean)) {
      const part = partRaw.replace(/~1/g, '/').replace(/~0/g, '~');
      node = node?.[part];
      if (node === undefined) throw new Error(`cannot resolve ${ref}`);
    }
    return { schema: node, id: file || currentId };
  }

  validate(value, schemaId, { path = '' } = {}) {
    const schema = this.schemas.get(schemaId);
    if (!schema) throw new Error(`unknown schema "${schemaId}"`);
    const errors = [];
    this._check(value, schema, schemaId, path, errors);
    return errors;
  }

  _check(value, schema, currentId, path, errors) {
    if (!schema || typeof schema !== 'object') return;

    if (schema.$ref) {
      const { schema: target, id } = this.resolve(schema.$ref, currentId);
      this._check(value, target, id, path, errors);
      return;
    }

    const at = path || '(root)';

    /* type */
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      if (!types.some((t) => matchesType(value, t))) {
        errors.push({ path: at, message: `expected ${types.join(' or ')}, got ${describe(value)}` });
        return; // further checks would be noise
      }
    }

    /* enum / const */
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        path: at,
        message: `expected one of ${schema.enum.map((v) => JSON.stringify(v)).join(', ')} — got ${JSON.stringify(value)}`,
      });
    }
    if ('const' in schema && value !== schema.const) {
      errors.push({ path: at, message: `expected ${JSON.stringify(schema.const)}` });
    }

    /* strings */
    if (typeof value === 'string') {
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push({ path: at, message: `does not match ${schema.pattern} — got ${JSON.stringify(trim(value))}` });
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push({ path: at, message: `shorter than ${schema.minLength} characters` });
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push({ path: at, message: `longer than ${schema.maxLength} characters (${value.length})` });
      }
    }

    /* numbers */
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({ path: at, message: `below minimum ${schema.minimum}` });
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({ path: at, message: `above maximum ${schema.maximum}` });
      }
    }

    /* arrays */
    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        errors.push({ path: at, message: `needs at least ${schema.minItems} item(s), has ${value.length}` });
      }
      if (schema.maxItems !== undefined && value.length > schema.maxItems) {
        errors.push({ path: at, message: `allows at most ${schema.maxItems} item(s), has ${value.length}` });
      }
      if (schema.items) {
        value.forEach((item, i) => this._check(item, schema.items, currentId, `${path}[${i}]`, errors));
      }
    }

    /* objects */
    if (isPlainObject(value)) {
      for (const key of schema.required || []) {
        if (!(key in value) || value[key] === undefined) {
          errors.push({ path: path ? `${path}.${key}` : key, message: 'required field is missing' });
        }
      }
      const props = schema.properties || {};
      for (const [key, sub] of Object.entries(props)) {
        if (key in value && value[key] !== null) {
          this._check(value[key], sub, currentId, path ? `${path}.${key}` : key, errors);
        }
      }
      if (schema.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!(key in props)) {
            errors.push({
              path: path ? `${path}.${key}` : key,
              message: `unknown field — the schema does not allow "${key}" here`,
            });
          }
        }
      }
    }

    /* combinators */
    if (schema.oneOf || schema.anyOf) {
      const branches = schema.oneOf || schema.anyOf;
      const results = branches.map((b) => {
        const sub = [];
        this._check(value, b, currentId, path, sub);
        return sub;
      });
      const passing = results.filter((r) => r.length === 0).length;
      if (passing === 0) {
        errors.push({
          path: at,
          message: `does not match any allowed shape (${branches.length} tried); closest complaint: ${
            results.sort((a, b) => a.length - b.length)[0]?.[0]?.message || 'unknown'
          }`,
        });
      }
    }
  }
}

function matchesType(value, type) {
  switch (type) {
    case 'object': return isPlainObject(value);
    case 'array': return Array.isArray(value);
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'integer': return Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    case 'null': return value === null;
    default: return true;
  }
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function describe(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `array(${v.length})`;
  if (typeof v === 'object') return 'object';
  return `${typeof v} ${JSON.stringify(trim(v))}`;
}

function trim(s) {
  const str = String(s);
  return str.length > 60 ? `${str.slice(0, 57)}…` : str;
}
