# RCP Context Assertion Type Registry v0.1

> Status: Experimental registry for RCP Core v0.1.

`assertion_type` describes the semantic role of a `ContextAssertion`. It is distinct from `epistemic_class`, which describes how strongly the statement is known.

For example, a commitment can be an `extracted_fact`, while a preference can be a `source_statement` or a `system_interpretation`.

## Core assertion types

| Type | Meaning |
| --- | --- |
| `fact` | General factual context not covered by a more specific type. |
| `source_statement` | A statement attributable to a source. |
| `commitment` | A future obligation or promise attributed to one or more actors. |
| `decision` | A decision that has been made. |
| `preference` | A preference, communication style, or choice relevant to the relationship. |
| `interest` | An expressed or observed area of interest. |
| `goal` | A stated goal or desired future outcome. |
| `status` | A current state that may change over time. |
| `event` | A relationship-relevant event. |
| `open_loop` | An unresolved item requiring future resolution. |
| `followup` | A follow-up that is expected or recommended. |
| `constraint` | A limitation affecting the relationship or an intended action. |
| `risk` | A relationship-relevant risk statement. This type MUST NOT be used to bypass sensitive-inference restrictions. |
| `organization_context` | Context primarily about an organization relevant to the relationship. |
| `relationship_context` | General relationship-level context not represented by another type. |
| `strategy` | A recommended approach for the user. A strategy MUST NOT be represented as a verified fact about another person. |

## Extensions

Provider- or domain-specific assertion types MAY use:

```text
x-<namespace>:<name>
```

Consumers that do not understand an extension type MAY preserve and display it, but MUST NOT silently reinterpret it as a registered Core type.
