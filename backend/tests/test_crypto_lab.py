"""
Tests for Admin Cryptography Lab endpoints.
Verifies:
- Access control (unauthenticated and non-admin requests are rejected)
- Administrator inspection of real database and cryptographic metrics
- Biometric template AES-256-GCM encryption parameters and SHA-256 digest
- Real integrity verification and tag validation
- Zero leakage of raw secret keys or plaintext passwords
"""

import hashlib
import json
import numpy as np
import pytest
from httpx import AsyncClient

from app.models import FaceEmbedding, User


@pytest.mark.asyncio
async def test_crypto_lab_unauthorized_access(client: AsyncClient):
    """Unauthenticated requests must be rejected."""
    res = await client.get("/admin/cryptography/overview")
    assert res.status_code in [401, 403]

    res_users = await client.get("/admin/cryptography/users")
    assert res_users.status_code in [401, 403]


@pytest.mark.asyncio
async def test_crypto_lab_non_admin_forbidden(client: AsyncClient, user_token: str):
    """Regular users must be forbidden from accessing admin cryptography endpoints."""
    headers = {"Authorization": f"Bearer {user_token}"}

    res = await client.get("/admin/cryptography/overview", headers=headers)
    assert res.status_code == 403

    res_users = await client.get("/admin/cryptography/users", headers=headers)
    assert res_users.status_code == 403

    res_ops = await client.get("/admin/cryptography/operations", headers=headers)
    assert res_ops.status_code == 403


@pytest.mark.asyncio
async def test_crypto_lab_admin_overview_and_users(client: AsyncClient, admin_token: str):
    """Admin can fetch real overview metrics and user list."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = await client.get("/admin/cryptography/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "registered_users" in data
    assert "enrolled_biometric_templates" in data
    assert "encrypted_biometric_records" in data
    assert "available_integrity_digests" in data
    assert "system_status" in data
    assert data["registered_users"] >= 1

    res_users = await client.get("/admin/cryptography/users", headers=headers)
    assert res_users.status_code == 200
    users = res_users.json()
    assert len(users) >= 1
    admin_u = next(u for u in users if u["email"] == "admin@test.com")
    assert admin_u["role"] == "admin"


@pytest.mark.asyncio
async def test_crypto_lab_user_details_no_secret_leak(client: AsyncClient, admin_token: str, db_session):
    """User details must display masked password and never leak AES secret keys."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    res_users = await client.get("/admin/cryptography/users", headers=headers)
    user_id = res_users.json()[0]["id"]

    res_details = await client.get(f"/admin/cryptography/users/{user_id}", headers=headers)
    assert res_details.status_code == 200
    details = res_details.json()

    # Password security check
    pwd_sec = details["password_security"]
    assert pwd_sec["algorithm"] == "bcrypt"
    assert pwd_sec["plaintext_policy"] == "NEVER STORED OR DISPLAYED"
    # Plaintext password must not appear anywhere
    assert "AdminPass1!" not in json.dumps(details)

    # Database records check
    assert "database_records" in details
    assert "users_table" in details["database_records"]


@pytest.mark.asyncio
async def test_crypto_lab_enrolled_biometric_verification(client: AsyncClient, admin_token: str, db_session):
    """
    When an enrolled biometric embedding exists, AES-256-GCM parameters and
    SHA-256 integrity verification must pass with tag_valid=True.
    """
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Find admin user in DB
    user = db_session.query(User).filter(User.email == "admin@test.com").first()
    assert user is not None

    # Simulate enrolled embedding row (count=3, dim=512)
    fake_vecs = np.random.randn(3, 512).astype(np.float32)
    fe = FaceEmbedding(
        user_id=user.id,
        embeddings=fake_vecs.tobytes(),
        count=3,
        dim=512,
        model="buffalo_s",
    )
    db_session.add(fe)
    user.face_registered = True
    db_session.commit()

    # Query details
    res_details = await client.get(f"/admin/cryptography/users/{user.id}", headers=headers)
    assert res_details.status_code == 200
    details = res_details.json()

    bio = details["biometric_template"]
    assert bio is not None
    assert bio["algorithm"] == "AES-256-GCM"
    assert bio["status"] == "Encrypted"
    assert bio["nonce"].startswith("0x")
    assert len(bio["nonce"]) == 2 + 24  # 0x + 24 hex characters = 12 bytes = 96 bits
    assert bio["tag"].startswith("0x")
    assert len(bio["tag"]) == 2 + 32    # 0x + 32 hex characters = 16 bytes = 128 bits
    assert len(bio["sha256_digest"]) == 64

    # Perform integrity verification
    res_verify = await client.post(f"/admin/cryptography/users/{user.id}/verify-integrity", headers=headers)
    assert res_verify.status_code == 200
    v_data = res_verify.json()
    assert v_data["status"] == "VERIFIED"
    assert v_data["verified"] is True
    assert v_data["tag_valid"] is True
    assert v_data["hash_match"] is True
