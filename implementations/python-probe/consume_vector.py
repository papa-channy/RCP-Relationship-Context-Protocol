#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
from pathlib import Path

from jwcrypto import jwk

from rcp_jose import verify_and_decrypt


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("usage: consume_vector.py <vector.json>")

    vector = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    if vector.get("profile") != "rcp-jose-x25519-a256gcm-ed25519-v0.1":
        raise ValueError("unsupported interop profile")

    recipient_private = jwk.JWK(**vector["recipient_private_jwk"])
    sender_public = jwk.JWK(**vector["sender_public_jwk"])

    plaintext = verify_and_decrypt(
        vector["envelope"], sender_public, recipient_private
    )

    if plaintext != vector["plaintext"]:
        raise AssertionError("decrypted RCP plaintext does not match vector")

    print(f"Python consumed {vector.get('producer', 'unknown')} RCP vector: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
