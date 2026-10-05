"""Independent Python probe for the experimental RCP JOSE profile.

This module intentionally does not import the RCP conformance oracle or Node
reference code. It implements the published crypto profile using jwcrypto,
cryptography-backed OKP operations exposed by jwcrypto, and rfc8785.

It is an interoperability probe, not a production SDK.
"""

from __future__ import annotations

import base64
import json
from copy import deepcopy
from typing import Any

import rfc8785
from jwcrypto import jwe, jwk

PROFILE = "rcp-jose-x25519-a256gcm-ed25519-v0.1"


def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def b64url_decode(value: str) -> bytes:
    padding = "=" * ((4 - len(value) % 4) % 4)
    return base64.urlsafe_b64decode(value + padding)


def canonical_bytes(value: Any) -> bytes:
    return rfc8785.dumps(value)


def compact_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def public_jwk(key: jwk.JWK) -> dict[str, Any]:
    return key.export(private_key=False, as_dict=True)


def private_jwk(key: jwk.JWK) -> dict[str, Any]:
    return key.export(private_key=True, as_dict=True)


def generate_recipient_key(kid: str) -> jwk.JWK:
    return jwk.JWK.generate(kty="OKP", crv="X25519", kid=kid, use="enc")


def generate_signing_key(kid: str) -> jwk.JWK:
    return jwk.JWK.generate(
        kty="OKP", crv="Ed25519", kid=kid, use="sig", alg="Ed25519"
    )


def encrypt_payload(payload: dict[str, Any], recipient_public: jwk.JWK) -> str:
    header = {
        "alg": "ECDH-ES",
        "enc": "A256GCM",
        "kid": recipient_public.get("kid"),
        "typ": "application/rcp+jwe",
        "cty": "application/rcp+json",
    }
    token = jwe.JWE(
        canonical_bytes(payload),
        protected=compact_json(header),
        algs=["ECDH-ES", "A256GCM"],
    )
    token.add_recipient(recipient_public)
    return token.serialize(compact=True)


def decrypt_payload(compact_jwe: str, recipient_private: jwk.JWK) -> dict[str, Any]:
    token = jwe.JWE(algs=["ECDH-ES", "A256GCM"])
    token.deserialize(compact_jwe, key=recipient_private)
    header = token.jose_header

    if header.get("alg") != "ECDH-ES":
        raise ValueError("unexpected JWE alg")
    if header.get("enc") != "A256GCM":
        raise ValueError("unexpected JWE enc")
    if header.get("typ") != "application/rcp+jwe":
        raise ValueError("unexpected JWE typ")
    if header.get("cty") != "application/rcp+json":
        raise ValueError("unexpected JWE cty")
    if "zip" in header:
        raise ValueError("JWE zip is prohibited by the RCP profile")

    expected_kid = recipient_private.get("kid")
    if expected_kid and header.get("kid") != expected_kid:
        raise ValueError("JWE kid does not identify the recipient key")

    return json.loads(token.payload.decode("utf-8"))


def unsigned_envelope(envelope: dict[str, Any]) -> dict[str, Any]:
    value = deepcopy(envelope)
    value.pop("signature", None)
    return value


def protected_jws_header(kid: str) -> dict[str, Any]:
    return {
        "alg": "Ed25519",
        "kid": kid,
        "typ": "application/rcp+jws",
        "b64": False,
        "crit": ["b64"],
    }


def sign_envelope(envelope_without_signature: dict[str, Any], signing_private: jwk.JWK) -> dict[str, str]:
    header_bytes = compact_json(protected_jws_header(signing_private.get("kid"))).encode("utf-8")
    protected = b64url_encode(header_bytes)
    payload = canonical_bytes(envelope_without_signature)
    signing_input = protected.encode("ascii") + b"." + payload

    private_key = signing_private.get_op_key("sign")
    signature = private_key.sign(signing_input)

    return {
        "profile": PROFILE,
        "protected": protected,
        "signature": b64url_encode(signature),
    }


def verify_envelope_signature(envelope: dict[str, Any], signing_public: jwk.JWK) -> None:
    signature_obj = envelope.get("signature") or {}
    if signature_obj.get("profile") != PROFILE:
        raise ValueError("unsupported RCP signature profile")

    protected = signature_obj.get("protected")
    signature_text = signature_obj.get("signature")
    if not protected or not signature_text:
        raise ValueError("missing detached JWS fields")

    header = json.loads(b64url_decode(protected).decode("utf-8"))
    if header.get("alg") != "Ed25519":
        raise ValueError("unexpected JWS alg")
    if header.get("kid") != signing_public.get("kid"):
        raise ValueError("unexpected JWS kid")
    if header.get("typ") != "application/rcp+jws":
        raise ValueError("unexpected JWS typ")
    if header.get("b64") is not False:
        raise ValueError("RCP detached JWS requires b64=false")
    if header.get("crit") != ["b64"]:
        raise ValueError("RCP detached JWS requires crit=[b64]")

    payload = canonical_bytes(unsigned_envelope(envelope))
    signing_input = protected.encode("ascii") + b"." + payload

    public_key = signing_public.get_op_key("verify")
    public_key.verify(b64url_decode(signature_text), signing_input)


def make_envelope(
    payload: dict[str, Any],
    recipient_public: jwk.JWK,
    signing_private: jwk.JWK,
    *,
    sender: str,
    recipient: str,
    decision_ref: str,
) -> dict[str, Any]:
    encrypted = encrypt_payload(payload, recipient_public)

    unsigned = {
        "type": "rcp.secure_envelope",
        "rcp_version": "0.1",
        "envelope_id": "envelope:python-probe:001",
        "sender": sender,
        "recipient": recipient,
        "action": "process",
        "resource_ref": "demo:mail:context:b",
        "resource_class": "relationship_context",
        "purpose": "meeting_preparation",
        "destination": "user:a:private-memory",
        "processing_location": "device",
        "permission_decision_ref": decision_ref,
        "policy_refs": ["demo:mail:policy:relationship-memory-v1"],
        "issued_at": "2026-10-05T10:01:00Z",
        "expires_at": "2026-10-05T10:20:00Z",
        "payload": {
            "profile": PROFILE,
            "jwe": encrypted,
        },
    }

    return {**unsigned, "signature": sign_envelope(unsigned, signing_private)}


def verify_and_decrypt(
    envelope: dict[str, Any],
    signing_public: jwk.JWK,
    recipient_private: jwk.JWK,
) -> dict[str, Any]:
    if envelope.get("payload", {}).get("profile") != PROFILE:
        raise ValueError("unsupported RCP payload profile")

    verify_envelope_signature(envelope, signing_public)
    return decrypt_payload(envelope["payload"]["jwe"], recipient_private)
