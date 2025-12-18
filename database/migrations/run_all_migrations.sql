-- =====================================================
-- LIS GPB - RUN ALL MIGRATIONS SCRIPT
-- =====================================================
-- Description: Script tổng hợp để chạy tất cả migrations
-- Author: System
-- Date: 2024-01-15
-- Version: 1.0

-- =====================================================
-- SETUP ENVIRONMENT
-- =====================================================

-- Set session parameters
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF';

-- =====================================================
-- CREATE MIGRATION LOG TABLE
-- =====================================================

CREATE TABLE MIGRATION_LOG (
    ID VARCHAR2(36) PRIMARY KEY,
    MIGRATION_NAME VARCHAR2(100) NOT NULL,
    EXECUTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    STATUS VARCHAR2(20) NOT NULL,
    DESCRIPTION CLOB,
    EXECUTION_TIME NUMBER,
    ERROR_MESSAGE CLOB
);

-- =====================================================
-- STEP 1: CREATE ALL TABLES
-- =====================================================

PROMPT 'Step 1: Creating all tables...'

-- Execute table creation script
@@000_create_all_tables.sql

PROMPT 'Step 1 completed: All tables created successfully'

-- =====================================================
-- STEP 2: CREATE ADMIN USER AND SAMPLE DATA
-- =====================================================

PROMPT 'Step 2: Creating admin user and sample data...'

-- Execute admin user creation script
@@001_create_admin_user.sql

PROMPT 'Step 2 completed: Admin user and sample data created successfully'

-- =====================================================
-- STEP 2.5: FIX UUID GENERATION
-- =====================================================

PROMPT 'Step 2.5: Fixing UUID generation...'

-- Execute UUID generation fix script
@@002_fix_uuid_generation.sql

PROMPT 'Step 2.5 completed: UUID generation fixed successfully'

-- =====================================================
-- STEP 2.6: CREATE SAMPLE TYPES TABLE
-- =====================================================

PROMPT 'Step 2.6: Creating sample types table...'

-- Execute sample types creation script
@@003_create_bml_sample_types_table.sql

PROMPT 'Step 2.6 completed: Sample types table created successfully'

-- =====================================================
-- STEP 2.7: CREATE SAMPLE RECEPTIONS TABLE
-- =====================================================

PROMPT 'Step 2.7: Creating sample receptions table...'

-- Execute sample receptions creation script
@@004_create_bml_sample_receptions_table.sql

PROMPT 'Step 2.7 completed: Sample receptions table created successfully'

-- =====================================================
-- STEP 2.8: CREATE PATIENTS TABLE
-- =====================================================

PROMPT 'Step 2.8: Creating patients table...'

-- Execute patients creation script
@@005_create_bml_patients_table.sql

PROMPT 'Step 2.8 completed: Patients table created successfully'

-- =====================================================
-- STEP 2.9: ADD CODE GENERATION FIELDS TO SAMPLE TYPES
-- =====================================================

PROMPT 'Step 2.9: Adding code generation fields to sample types...'

-- Execute code generation fields addition script
@@006_add_code_generation_fields_to_sample_types.sql

PROMPT 'Step 2.9 completed: Code generation fields added successfully'

-- =====================================================
-- STEP 2.10: UPDATE SAMPLE RECEPTIONS FOR CODE GENERATION
-- =====================================================

PROMPT 'Step 2.10: Updating sample receptions for code generation...'

-- Execute sample receptions update script
@@007_update_sample_receptions_for_code_generation.sql

PROMPT 'Step 2.10 completed: Sample receptions updated for code generation successfully'

-- =====================================================
-- STEP 2.11: CREATE SERVICE GROUPS TABLE
-- =====================================================

PROMPT 'Step 2.11: Creating service groups table...'

-- Execute service groups creation script
@@008_create_bml_service_groups_table.sql

PROMPT 'Step 2.11 completed: Service groups table created successfully'

-- =====================================================
-- STEP 2.12: CREATE PROFILES TABLE
-- =====================================================

PROMPT 'Step 2.12: Creating profiles table...'

-- Execute profiles creation script
@@009_create_bml_profiles_table.sql

PROMPT 'Step 2.12 completed: Profiles table created successfully'

-- =====================================================
-- STEP 2.13: CREATE USER ROOMS TABLE
-- =====================================================

PROMPT 'Step 2.13: Creating user rooms table...'

-- Execute user rooms creation script
@@010_create_user_rooms_table.sql

PROMPT 'Step 2.13 completed: User rooms table created successfully'

-- =====================================================
-- STEP 2.14: CREATE SERVICES TABLE
-- =====================================================

PROMPT 'Step 2.14: Creating services table...'

-- Execute services creation script
@@012_create_bml_services_table.sql

PROMPT 'Step 2.14 completed: Services table created successfully'

-- =====================================================
-- STEP 2.15: CREATE UNITS OF MEASURE TABLE
-- =====================================================

PROMPT 'Step 2.15: Creating units of measure table...'

-- Execute UOM creation script
@@012_create_bml_units_of_measure.sql

PROMPT 'Step 2.15 completed: Units of measure table created successfully'

-- =====================================================
-- STEP 2.16: CREATE WORKFLOW STATES TABLE
-- =====================================================

PROMPT 'Step 2.16: Creating workflow states table...'

-- Execute workflow states creation script
@@013_create_bml_workflow_states_table.sql

PROMPT 'Step 2.16 completed: Workflow states table created successfully'

-- =====================================================
-- STEP 2.17: CREATE WORKFLOW HISTORY TABLE (Gộp Module 2+3)
-- =====================================================

PROMPT 'Step 2.17: Creating workflow history table (gộp current state + history)...'

-- Execute workflow history creation script
@@014_create_bml_workflow_history_table.sql

PROMPT 'Step 2.17 completed: Workflow history table created successfully'

-- =====================================================
-- STEP 3: VERIFY INSTALLATION
-- =====================================================

PROMPT 'Step 3: Verifying installation...'

-- Check all tables exist
SELECT 'Tables Created' as CHECK_TYPE, COUNT(*) as COUNT
FROM USER_TABLES 
WHERE TABLE_NAME LIKE 'BML_%';

-- Check all indexes exist
SELECT 'Indexes Created' as CHECK_TYPE, COUNT(*) as COUNT
FROM USER_INDEXES 
WHERE TABLE_NAME LIKE 'BML_%';

-- Check all constraints exist
SELECT 'Constraints Created' as CHECK_TYPE, COUNT(*) as COUNT
FROM USER_CONSTRAINTS 
WHERE TABLE_NAME LIKE 'BML_%';

-- Check admin user exists
SELECT 'Admin User' as CHECK_TYPE, USERNAME, EMAIL, FULL_NAME, IS_ACTIVE
FROM BML_USERS 
WHERE USERNAME = 'admin';

-- Check sample data
SELECT 'Sample Data' as CHECK_TYPE, 
       (SELECT COUNT(*) FROM BML_PROVINCES) as PROVINCES,
       (SELECT COUNT(*) FROM BML_WARDS) as WARDS,
       (SELECT COUNT(*) FROM BML_BRANCHES) as BRANCHES,
       (SELECT COUNT(*) FROM BML_DEPARTMENT_TYPES) as DEPT_TYPES,
       (SELECT COUNT(*) FROM BML_DEPARTMENTS) as DEPARTMENTS,
       (SELECT COUNT(*) FROM BML_ROOM_GROUPS) as ROOM_GROUPS,
       (SELECT COUNT(*) FROM BML_ROOMS) as ROOMS,
       (SELECT COUNT(*) FROM BML_SAMPLE_TYPES) as SAMPLE_TYPES,
       (SELECT COUNT(*) FROM BML_SAMPLE_RECEPTIONS) as SAMPLE_RECEPTIONS,
       (SELECT COUNT(*) FROM BML_PATIENTS) as PATIENTS
FROM DUAL;

-- =====================================================
-- STEP 4: FINAL VERIFICATION
-- =====================================================

PROMPT 'Step 4: Final verification...'

-- Verify foreign key relationships
SELECT 'Foreign Keys' as CHECK_TYPE, 
       CONSTRAINT_NAME, 
       TABLE_NAME, 
       R_CONSTRAINT_NAME
FROM USER_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'R' 
AND TABLE_NAME LIKE 'BML_%'
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- Verify triggers
SELECT 'Triggers' as CHECK_TYPE, 
       TRIGGER_NAME, 
       TABLE_NAME, 
       STATUS
FROM USER_TRIGGERS 
WHERE TABLE_NAME LIKE 'BML_%'
ORDER BY TABLE_NAME, TRIGGER_NAME;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

PROMPT '====================================================='
PROMPT 'LIS GPB DATABASE SETUP COMPLETED SUCCESSFULLY!'
PROMPT '====================================================='
PROMPT 'Admin User: admin'
PROMPT 'Password: Admin123!'
PROMPT 'Email: admin@lisgpb.com'
PROMPT '====================================================='
PROMPT 'Tables Created:'
PROMPT '- BML_USERS (Users)'
PROMPT '- BML_PROVINCES (Provinces)'
PROMPT '- BML_WARDS (Wards)'
PROMPT '- BML_BRANCHES (Branches)'
PROMPT '- BML_DEPARTMENT_TYPES (Department Types)'
PROMPT '- BML_DEPARTMENTS (Departments)'
PROMPT '- BML_ROOM_GROUPS (Room Groups)'
PROMPT '- BML_ROOMS (Rooms)'
PROMPT '- BML_SAMPLE_TYPES (Sample Types)'
PROMPT '- BML_SAMPLE_RECEPTIONS (Sample Receptions)'
PROMPT '- BML_PATIENTS (Patients)'
PROMPT '====================================================='

-- Log completion
INSERT INTO MIGRATION_LOG (ID, MIGRATION_NAME, EXECUTED_AT, STATUS, DESCRIPTION) 
VALUES (
    'migration-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISS'),
    'run_all_migrations',
    CURRENT_TIMESTAMP,
    'SUCCESS',
    'All LIS GPB tables, indexes, constraints, triggers, and sample data created successfully'
);

COMMIT;

PROMPT 'Migration completed successfully!'
