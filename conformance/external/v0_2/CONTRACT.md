# RCP v0.2 External Semantic Harness Contract

> **Status:** non-normative black-box test contract.
>
> This contract exists only to test independent implementations. It is not an RCP network binding or Core wire object.

## 1. Process model

The harness starts the implementation adapter as a subprocess for each case.

The adapter:

1. reads one UTF-8 JSON object from stdin until EOF;
2. writes exactly one UTF-8 JSON object to stdout;
3. exits with code `0` if it produced a syntactically valid harness response.

Semantic rejection is represented with `accepted: false`; it is not a process failure.

Diagnostics may be written to stderr.

## 2. Request

```json
{
  "contract_version": "rcp-v0.2-cleanroom-1",
  "operation": "evaluate_context_assertion",
  "supported_extensions": [],
  "assertion": {}
}
```

Fields:

- `contract_version` — fixed harness contract identifier;
- `operation` — currently fixed to `evaluate_context_assertion`;
- `supported_extensions` — namespaced semantic extensions the evaluator should treat as understood for this case;
- `assertion` — the candidate RCP `ContextAssertion` object.

The implementation must not rely on case IDs; the request deliberately contains none.

## 3. Response

Accepted response:

```json
{
  "contract_version": "rcp-v0.2-cleanroom-1",
  "accepted": true,
  "errors": [],
  "semantic_digest": {
    "assertion_id": "assertion:example",
    "assertion_type": "commitment",
    "epistemic_class": "system_interpretation",
    "scope_type": "bilateral",
    "target_participants": [
      ["tenant:t1", "A", "person"],
      ["tenant:t1", "B", "person"]
    ],
    "evidence_refs": [],
    "material_dependency_refs": ["evidence:a"],
    "support_sets": [["evidence:a"]],
    "policy_refs": [],
    "lifecycle_state": "active",
    "required_extensions": []
  }
}
```

Rejected response:

```json
{
  "contract_version": "rcp-v0.2-cleanroom-1",
  "accepted": false,
  "errors": ["human-readable or machine-readable implementation diagnostic"],
  "semantic_digest": null
}
```

`errors` content is not compared for equality by the harness. Independent implementations may use their own diagnostic taxonomy.

## 4. Harness semantic digest

The digest is a **test projection**, not a normative RCP object.

For accepted assertions it contains:

- `assertion_id`
- `assertion_type`
- `epistemic_class`
- `scope_type`
- `target_participants`
- `evidence_refs`
- `material_dependency_refs`
- `support_sets`
- `policy_refs`
- `lifecycle_state`
- `required_extensions`

Normalization rules:

### target participants

Each actor is represented as:

```text
[scope, actor_id, actor_type]
```

The outer array is sorted lexicographically.

### evidence refs

Collect `provenance.evidence[*].evidence_ref` and sort lexicographically.

### material dependency refs

Collect `provenance.derivation.dependencies[*].dependency_ref` where `material == true` and sort lexicographically.

### support sets

For each support set:

1. sort refs lexicographically;
2. sort the outer list lexicographically by its JSON-array value.

### policy refs

Sort top-level `policy_refs` lexicographically.

### required extensions

Sort `required_extensions` lexicographically.

The digest intentionally excludes statement text, provider-specific evidence channels, timestamps, transport metadata, diagnostic text, and non-material dependencies.

## 5. Validation responsibility

The adapter is responsible for independently deciding whether the assertion is accepted under the applicable v0.2 draft specification.

The external harness does **not** send expected answers to the adapter.

The harness compares the adapter response with the case pack after the adapter exits.

## 6. Process errors

The harness treats any of the following as test failure:

- adapter timeout;
- non-zero process exit;
- invalid JSON stdout;
- multiple JSON documents or non-JSON stdout noise;
- wrong `contract_version`;
- missing `accepted`;
- `accepted: true` without `semantic_digest`;
- `accepted: false` with a non-null digest;
- accepted/rejected result differs from expected case outcome;
- digest differs from expected digest on an accepted case.

## 7. Case pack format

```json
{
  "case_pack_version": "rcp-v0.2-cleanroom-cases-1",
  "rcp_revision": "<commit-or-tag-or-main-for-repository-self-test>",
  "cases": [
    {
      "id": "human-readable-harness-id",
      "supported_extensions": [],
      "assertion": {},
      "expected": {
        "accepted": true,
        "semantic_digest": {}
      }
    }
  ]
}
```

The case `id` is used only by the harness/report. It is not passed to the adapter.

For rejected cases:

```json
"expected": {
  "accepted": false
}
```

## 8. Held-out cases

The harness accepts any case pack following the same format.

Independent reviewers SHOULD add held-out cases that are derived from the published specification but are not committed to the implementation repository before evaluation.

The held-out pack may test additional ordering, reference, extension, participant, policy, and dependency combinations without changing this adapter contract.

## 9. Report

The harness emits a JSON report containing:

- harness/case-pack version;
- RCP revision supplied by evaluator;
- implementation name/version/language;
- command metadata;
- timestamp;
- per-case pass/fail;
- expected vs actual acceptance;
- digest mismatch details when applicable;
- aggregate totals.

The report is evidence for review, not a certificate.