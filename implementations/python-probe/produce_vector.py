#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
from pathlib import Path

from rcp_jose import (
    generate_recipient_key,
    generate_signing_key,
    make_envelope,
    private_jwk,
    public_jwk,
)


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("usage: produce_vector.py <output.json>")

    recipient = generate_recipient_key("python-recipient-enc-1")
    signer = generate_signing_key("python-provider-sign-1")

    payload = {
        "type": "rcp.context_assertion",
        "rcp_version": "0.1",
        "assertion_id": "assertion:python-probe:001",
        "assertion_type": "commitment",
        "epistemic_class": "source_statement",
        "statement": "A and B agreed to revisit Project X in November.",
        "subjects": ["user:a", "person:b"],
        "provenance": {
            "origin_type": "provider_generated",
            "visibility": "redacted",
        },
        "status": "active",
        "created_at": "2026-10-05T10:00:00Z",
    }

    envelope = make_envelope(
        payload,
        recipient,
        signer,
        sender="provider:python-probe",
        recipient="consumer:node-probe",
        decision_ref="decision:python-probe:001",
    )

    vector = {
        "producer": "python-jwcrypto-rfc8785",
        "profile": "rcp-jose-x25519-a256gcm-ed25519-v0.1",
        "plaintext": payload,
        "envelope": envelope,
        "recipient_private_jwk": private_jwk(recipient),
        "sender_public_jwk": public_jwk(signer),
    }

    Path(sys.argv[1]).write_text(
        json.dumps(vector, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("Python RCP interop vector produced")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
