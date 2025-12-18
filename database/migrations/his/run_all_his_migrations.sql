-- Run all HIS database migrations
-- Execute this script to create all HIS tables and sample data

-- 001: Create HIS Service Requests table
@001_create_his_service_requests_table.sql

-- 002: Create HIS Service Request Details table
@002_create_his_service_request_details_table.sql

-- 003: Create HIS Service Tests table
@003_create_his_service_tests_table.sql

-- 004: Insert sample data
@004_insert_his_sample_data.sql

-- Show completion message
SELECT 'HIS Database migration completed successfully!' AS MESSAGE FROM DUAL;
