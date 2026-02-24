-- Remove 2FA OTP expires-at column; OTP hashes are stored in twoFactorOtpCodeHash
ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorOtpExpiresAt";
