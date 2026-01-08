from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# This is the hash I saw in Step 427/400
hash_val = "$pbkdf2-sha256$29000$PebzQYVvS3DmLGIa7I4XOTubmmScXDFcv5jGYCL2X8yYM"

print(f"Verify 'admin123': {pwd_context.verify('admin123', hash_val)}")
