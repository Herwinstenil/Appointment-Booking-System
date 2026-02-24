-- Add TOTP secret fields for two-factor setup and verification
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorTempSecret" TEXT;
