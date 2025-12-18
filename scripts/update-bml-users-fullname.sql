-- =====================================================
-- Script: Update BML_USERS table - Merge FIRST_NAME + LAST_NAME to FULL_NAME
-- Database: Oracle 12c
-- =====================================================

-- Step 1: Add new FULL_NAME column
ALTER TABLE BML_USERS ADD FULL_NAME VARCHAR2(100);

-- Step 2: Update existing data - merge FIRST_NAME + LAST_NAME to FULL_NAME
UPDATE BML_USERS 
SET FULL_NAME = TRIM(FIRST_NAME || ' ' || LAST_NAME)
WHERE FIRST_NAME IS NOT NULL AND LAST_NAME IS NOT NULL;

-- Step 3: Handle cases where only one name exists
UPDATE BML_USERS 
SET FULL_NAME = COALESCE(FIRST_NAME, LAST_NAME)
WHERE (FIRST_NAME IS NULL OR LAST_NAME IS NULL) 
  AND (FIRST_NAME IS NOT NULL OR LAST_NAME IS NOT NULL);

-- Step 4: Set default for any remaining NULL values
UPDATE BML_USERS 
SET FULL_NAME = 'Unknown User'
WHERE FULL_NAME IS NULL;

-- Step 5: Make FULL_NAME NOT NULL
ALTER TABLE BML_USERS MODIFY FULL_NAME NOT NULL;

-- Step 6: Drop old columns
ALTER TABLE BML_USERS DROP COLUMN FIRST_NAME;
ALTER TABLE BML_USERS DROP COLUMN LAST_NAME;

-- Step 7: Add constraint for FULL_NAME length
ALTER TABLE BML_USERS ADD CONSTRAINT CK_BML_USERS_FULL_NAME 
    CHECK (LENGTH(FULL_NAME) >= 2 AND LENGTH(FULL_NAME) <= 100);

-- Step 8: Create index for FULL_NAME (optional, for search performance)
CREATE INDEX IDX_BML_USERS_FULL_NAME ON BML_USERS(FULL_NAME);

-- Step 9: Update sample data
UPDATE BML_USERS 
SET FULL_NAME = 'System Administrator'
WHERE USERNAME = 'admin';

UPDATE BML_USERS 
SET FULL_NAME = 'John Doe'
WHERE USERNAME = 'john_doe';

-- Commit the transaction
COMMIT;

-- Display updated table structure
DESC BML_USERS;

-- Display sample data
SELECT ID, USERNAME, EMAIL, FULL_NAME, IS_ACTIVE, CREATED_AT 
FROM BML_USERS 
ORDER BY CREATED_AT;

-- =====================================================
-- Script completed successfully!
-- =====================================================
