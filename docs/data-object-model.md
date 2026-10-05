# Data Object Model — Design Draft

Every persistent RCP object should preserve enough metadata to answer:

- what it is,
- who/what it concerns,
- where it came from,
- what relationship/interaction it belongs to,
- what restrictions apply,
- whether it is source data or derived context,
- when it remains valid.

## Initial object families

- Identity / Person / Organization
- Relationship / Interaction
- Content / Metadata / Artifact
- UserNote
- ContextAssertion
- Commitment / OpenLoop / Preference
- RelationshipState
- Inference / Strategy
- SourceReference / Provenance / RetentionPolicy

## Key distinctions

- Person != platform identity
- author != subject
- content != metadata
- raw communication != relationship memory
- source statement != verified fact
- user observation != system inference
- personal sensitivity != organization confidentiality
