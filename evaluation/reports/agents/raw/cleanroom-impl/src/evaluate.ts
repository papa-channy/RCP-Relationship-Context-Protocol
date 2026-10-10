// Clean-room RCP v0.2 draft ContextAssertion evaluator.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(join(here, "..", "schema.json"), "utf8"));

const ajv = new (Ajv2020 as any)({ allErrors: true, strict: false });
(addFormats as any)(ajv);
const validateSchema = ajv.compile(schema);

type Json = any;

export interface Evaluation {
  accepted: boolean;
  errors: string[];
  digest: Json | null;
}

// Code point order comparison (matches Unicode code point ordering, not UTF-16 unit order).
function cmpStr(a: string, b: string): number {
  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();
  for (;;) {
    const x = ia.next();
    const y = ib.next();
    if (x.done && y.done) return 0;
    if (x.done) return -1;
    if (y.done) return 1;
    const cx = (x.value as string).codePointAt(0)!;
    const cy = (y.value as string).codePointAt(0)!;
    if (cx !== cy) return cx < cy ? -1 : 1;
  }
}

// Element-wise list comparison (shorter prefix sorts first).
function cmpList(a: string[], b: string[]): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const c = cmpStr(a[i], b[i]);
    if (c !== 0) return c;
  }
  return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
}

const sortStrs = (xs: string[]) => [...xs].sort(cmpStr);

const actorKey = (a: Json): string => JSON.stringify([a.scope, a.actor_id, a.actor_type]);

const EXT_RE = /^x-[A-Za-z0-9.-]+:[A-Za-z0-9_.-]+$/;

export function evaluate(assertion: Json, supportedExtensions: string[]): Evaluation {
  const errors: string[] = [];
  const supported = new Set<string>(supportedExtensions ?? []);

  if (assertion === null || typeof assertion !== "object" || Array.isArray(assertion)) {
    return { accepted: false, errors: ["assertion must be a JSON object"], digest: null };
  }

  // 1. Structural validation (JSON Schema 2020-12 incl. formats).
  if (!validateSchema(assertion)) {
    for (const e of validateSchema.errors ?? []) {
      errors.push(`schema: ${e.instancePath || "/"} ${e.message}`);
    }
    return { accepted: false, errors, digest: null };
  }

  const a = assertion;
  const scope = a.relationship_scope;
  const prov = a.provenance;
  const evidence: Json[] = prov.evidence ?? [];
  const deps: Json[] = prov.derivation?.dependencies ?? [];
  const supportSets: string[][] = prov.derivation?.support_sets ?? [];

  // 2. Relationship scope: cardinality and fail-closed on unknown scope semantics.
  const targetKeys = new Set<string>(scope.participants.map(actorKey));
  const targetIds = new Set<string>(scope.participants.map((p: Json) => JSON.stringify([p.scope, p.actor_id])));
  if (targetIds.size !== scope.participants.length) {
    errors.push("relationship_scope.participants contains the same scoped actor more than once");
  }
  switch (scope.scope_type) {
    case "bilateral":
      if (scope.participants.length !== 2) errors.push("bilateral scope requires exactly 2 participants");
      break;
    case "group":
      if (scope.participants.length < 3) errors.push("group scope requires at least 3 participants");
      break;
    case "organization_mediated":
    case "provider_defined":
      break;
    case "unknown":
      errors.push("relationship scope_type 'unknown' fails closed");
      break;
    default:
      if (EXT_RE.test(scope.scope_type)) {
        if (!supported.has(scope.scope_type)) {
          errors.push(`relationship scope_type extension ${scope.scope_type} is not supported (fail closed)`);
        }
      } else {
        errors.push(`unrecognised relationship scope_type ${scope.scope_type}`);
      }
  }

  // 3. Required extensions fail closed.
  for (const ext of a.required_extensions ?? []) {
    if (!supported.has(ext)) errors.push(`required extension ${ext} is not supported (fail closed)`);
  }

  // 4. Evidence integrity and participant projection.
  const evidenceRefs = new Set<string>();
  for (const ev of evidence) {
    if (evidenceRefs.has(ev.evidence_ref)) errors.push(`duplicate evidence_ref ${ev.evidence_ref}`);
    evidenceRefs.add(ev.evidence_ref);
    const srcKeys = new Set<string>(ev.source_participants.map(actorKey));
    let same = srcKeys.size === targetKeys.size;
    if (same) for (const k of srcKeys) if (!targetKeys.has(k)) { same = false; break; }
    if (!same && !ev.projection_basis_ref) {
      errors.push(`evidence ${ev.evidence_ref}: source participants differ from target scope without projection_basis_ref`);
    }
  }

  // 5. Dependency integrity.
  const depByRef = new Map<string, Json>();
  for (const d of deps) {
    const prev = depByRef.get(d.dependency_ref);
    if (prev) {
      if (prev.dependency_type !== d.dependency_type || prev.material !== d.material) {
        errors.push(`dependency ${d.dependency_ref} declared inconsistently`);
      }
    } else depByRef.set(d.dependency_ref, d);
    if (d.dependency_ref === a.assertion_id) errors.push("assertion cannot depend on itself");
  }

  // 6. Support sets must resolve to declared dependencies.
  for (const set of supportSets) {
    for (const ref of set) {
      if (!depByRef.has(ref)) errors.push(`support_sets references undeclared dependency ${ref}`);
    }
  }

  // 7. Verification basis must resolve into declared lineage.
  const lineage = new Set<string>([...evidenceRefs, ...depByRef.keys()]);
  for (const ref of a.verification_basis_refs ?? []) {
    if (!lineage.has(ref)) errors.push(`verification_basis_ref ${ref} does not resolve into declared lineage`);
  }

  // 8. Material identity / policy dependency preservation when derivation is declared.
  if (prov.derivation) {
    const matIdentity = new Set<string>(
      deps.filter((d) => d.material && d.dependency_type === "identity_binding").map((d) => d.dependency_ref),
    );
    for (const ref of scope.identity_dependency_refs ?? []) {
      if (!matIdentity.has(ref)) errors.push(`identity dependency ${ref} not preserved as material identity_binding dependency`);
    }
    const policyRefs = new Set<string>(a.policy_refs ?? []);
    for (const d of deps) {
      if (d.material && d.dependency_type === "policy" && !policyRefs.has(d.dependency_ref)) {
        errors.push(`material policy dependency ${d.dependency_ref} not carried in policy_refs`);
      }
    }
  }
  // Evidence-level restrictions are not erased by derivation/projection.
  {
    const policyRefs = new Set<string>(a.policy_refs ?? []);
    for (const ev of evidence) {
      for (const p of ev.policy_refs ?? []) {
        if (!policyRefs.has(p)) errors.push(`evidence ${ev.evidence_ref} policy ${p} not carried by assertion policy_refs`);
      }
    }
  }

  // 9. Self relations.
  for (const rel of a.assertion_relations ?? []) {
    if (rel.assertion_ref === a.assertion_id) errors.push(`assertion declares ${rel.relation} relation to itself`);
  }

  if (errors.length > 0) return { accepted: false, errors, digest: null };

  const digest = {
    assertion_id: a.assertion_id,
    assertion_type: a.assertion_type,
    epistemic_class: a.epistemic_class,
    scope_type: scope.scope_type,
    target_participants: scope.participants
      .map((p: Json) => [p.scope, p.actor_id, p.actor_type] as string[])
      .sort(cmpList),
    evidence_refs: sortStrs(evidence.map((e) => e.evidence_ref)),
    material_dependency_refs: sortStrs(deps.filter((d) => d.material === true).map((d) => d.dependency_ref)),
    support_sets: supportSets.map((s) => sortStrs(s)).sort(cmpList),
    policy_refs: sortStrs(a.policy_refs ?? []),
    lifecycle_state: a.lifecycle.state,
    required_extensions: sortStrs(a.required_extensions ?? []),
  };
  return { accepted: true, errors: [], digest };
}
