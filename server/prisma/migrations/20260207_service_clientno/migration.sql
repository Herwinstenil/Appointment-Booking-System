-- Drop Duration and rename Service.userId -> Service.clientNo (referencing User.clientNo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relkind = 'S'
      AND relname = 'user_client_no_seq'
  ) THEN
    CREATE SEQUENCE user_client_no_seq START 1000;
  END IF;
END$$;

UPDATE "User"
SET "clientNo" = nextval('user_client_no_seq')
WHERE "clientNo" IS NULL
   OR "clientNo" <= 0;

WITH duplicates AS (
  SELECT id
  FROM (
    SELECT
      id,
      "clientNo",
      ROW_NUMBER() OVER (PARTITION BY "clientNo" ORDER BY id) AS rn
    FROM "User"
    WHERE "clientNo" IS NOT NULL
  ) tmp
  WHERE tmp.rn > 1
)
UPDATE "User"
SET "clientNo" = nextval('user_client_no_seq')
FROM duplicates
WHERE "User".id = duplicates.id;

SELECT setval('user_client_no_seq', GREATEST((SELECT COALESCE(MAX("clientNo"), 1000) FROM "User"), 1000));

ALTER TABLE "User"
  DROP CONSTRAINT IF EXISTS "User_clientNo_key";
ALTER TABLE "User"
  ADD CONSTRAINT "User_clientNo_key" UNIQUE ("clientNo");

ALTER TABLE "Service"
  DROP CONSTRAINT IF EXISTS "Service_userId_fkey";
ALTER TABLE "Service"
  DROP COLUMN IF EXISTS "duration";
ALTER TABLE "Service"
  ADD COLUMN "clientNo" INTEGER;
UPDATE "Service" s
SET "clientNo" = u."clientNo"
FROM "User" u
WHERE u.id = s."userId";

ALTER TABLE "Service"
  ALTER COLUMN "clientNo" SET NOT NULL;
ALTER TABLE "Service"
  ADD CONSTRAINT "Service_clientNo_fkey"
    FOREIGN KEY ("clientNo")
    REFERENCES "User" ("clientNo")
    ON DELETE CASCADE;
ALTER TABLE "Service"
  DROP COLUMN "userId";
