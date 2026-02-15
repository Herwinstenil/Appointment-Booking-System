-- Drop the Instagram ID column previously used for social login
DROP INDEX IF EXISTS "User_instagramId_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "instagramId";
