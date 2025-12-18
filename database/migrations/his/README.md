# HIS Database Migrations

This directory contains migration scripts for the HIS (Hospital Information System) database.

## Migration Scripts

1. **001_create_his_service_requests_table.sql** - Creates the main service requests table
2. **002_create_his_service_request_details_table.sql** - Creates the service request details table
3. **003_create_his_service_tests_table.sql** - Creates the service tests table
4. **004_insert_his_sample_data.sql** - Inserts sample data for testing

## How to Run

### Option 1: Run All Migrations
```sql
@run_all_his_migrations.sql
```

### Option 2: Run Individual Scripts
```sql
@001_create_his_service_requests_table.sql
@002_create_his_service_request_details_table.sql
@003_create_his_service_tests_table.sql
@004_insert_his_sample_data.sql
```

## Database Connection

Make sure you're connected to the HIS database with the following credentials:
- Host: 192.168.7.248
- Port: 1521
- Service Name: orclstb
- Username: HIS_RS
- Password: HIS_RS

## Tables Created

### HSR_SERVICE_REQUESTS
Main table containing service request information including:
- Request details (ID, code, status, type, instruction time)
- Patient information (ID, code, name, DOB, address, gender)
- Location information (request/execute room and department)

### HSR_SERVICE_REQUEST_DETAILS
Details table containing service information including:
- Service details (ID, code, name, price, status)
- LIS mapping information (optional)

### HSR_SERVICE_TESTS
Tests table containing detailed test information including:
- Test details (code, name, description, price)
- Range information (low, high, text)
- Mapping information

## Sample Data

The migration includes sample data for testing:
- 1 service request (ID: 55537570)
- 5 service request details
- 3 service tests (for LIS mapped services)

## Notes

- All tables use Oracle 12c naming conventions
- Foreign key constraints are properly defined
- Indexes are created for performance
- Comments are added for documentation
