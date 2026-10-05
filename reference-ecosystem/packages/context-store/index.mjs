export class RelationshipContextStore {
  #subjects = new Map()
  #revision = 0

  #bucket(subject) {
    if (!this.#subjects.has(subject)) this.#subjects.set(subject, new Map())
    return this.#subjects.get(subject)
  }

  #nextRevision() {
    this.#revision += 1
    return this.#revision
  }

  upsertAssertions(subject, assertions) {
    const bucket = this.#bucket(subject)
    for (const assertion of assertions) bucket.set(assertion.assertion_id, structuredClone(assertion))
    const revision = this.#nextRevision()
    return { revision, inserted: assertions.length }
  }

  assertions(subject) {
    return [...this.#bucket(subject).values()].map((value) => structuredClone(value))
  }

  activeAssertions(subject) {
    return this.assertions(subject)
      .filter((assertion) => assertion.status === 'active')
      .sort((a, b) => {
        const timeCompare = a.created_at.localeCompare(b.created_at)
        return timeCompare !== 0 ? timeCompare : a.assertion_id.localeCompare(b.assertion_id)
      })
  }

  brief(subject) {
    const active = this.activeAssertions(subject)
    return {
      type: 'rcp.relationship_brief',
      rcp_version: '0.1',
      subject,
      store_revision: this.#revision,
      active_assertion_count: active.length,
      items: active.map((assertion) => ({
        assertion_id: assertion.assertion_id,
        assertion_type: assertion.assertion_type,
        epistemic_class: assertion.epistemic_class,
        statement: assertion.statement,
        provenance: assertion.provenance,
      })),
      text: active
        .map((assertion) => `- [${assertion.assertion_type}] ${assertion.statement}`)
        .join('\n'),
    }
  }

  snapshot(subject) {
    const assertions = this.assertions(subject)
    return {
      subject,
      store_revision: this.#revision,
      assertion_count: assertions.length,
      active_assertion_count: assertions.filter((assertion) => assertion.status === 'active').length,
      assertions,
      brief: this.brief(subject),
    }
  }

  applyRevocation(event) {
    if (event?.type !== 'rcp.revocation_event' || event?.rcp_version !== '0.1') {
      throw new Error('invalid revocation event')
    }
    if (!event.scope?.scope_type || !event.scope?.scope_id) {
      throw new Error('revocation scope required')
    }

    const affected = []
    const changedSubjects = new Set()

    for (const [subject, bucket] of this.#subjects.entries()) {
      for (const [assertionId, assertion] of bucket.entries()) {
        if (assertion.status !== 'active') continue
        const refs = assertion.provenance?.source_refs ?? []
        const matches = event.scope.scope_type === 'provider'
          ? refs.some((ref) => ref.startsWith(`${event.scope.scope_id}:`))
          : event.scope.scope_type === 'resource'
            ? refs.some((ref) => ref.startsWith(event.scope.scope_id))
            : false

        if (!matches) continue

        bucket.set(assertionId, {
          ...assertion,
          status: 'revoked',
        })
        affected.push(assertionId)
        changedSubjects.add(subject)
      }
    }

    const revision = affected.length > 0 ? this.#nextRevision() : this.#revision
    return {
      event_id: event.event_id,
      store_revision: revision,
      revoked_assertion_ids: affected,
      changed_subjects: [...changedSubjects],
      recomputed_briefs: [...changedSubjects].map((subject) => this.brief(subject)),
    }
  }
}
