-- Remove the Twitter-specific social login artifacts from users
DROP INDEX IF EXISTS "User_twitterId_key";
ALTER TABLE "User" DROP COLUMN IF EXISTS "twitterId";
