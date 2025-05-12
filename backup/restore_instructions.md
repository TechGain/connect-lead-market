
# Database Restore Instructions

If you need to restore the database to its original state before the security enhancements, follow these steps:

1. Open the Supabase Dashboard for your project
2. Go to the SQL Editor
3. Copy and paste the contents of `database_backup.sql` into the SQL Editor
4. Run the script

## When to Consider Restoration

You might want to restore the database if:

1. You encounter permission errors in your application that prevent users from accessing data they should be able to access
2. You notice performance degradation related to the Row Level Security (RLS) policies
3. You need to restructure your security approach

## Before Running the Restore Script

Before restoring the database to its original state, consider these steps:

1. **Backup Current Data**: Export any important data that has been added since the security enhancement
2. **Disable RLS temporarily**: As an alternative to full restoration, you can temporarily disable RLS on problematic tables
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```
3. **Drop specific policies**: Instead of a full restore, you might want to drop specific problematic policies
   ```sql
   DROP POLICY policy_name ON table_name;
   ```
4. **Review application logs**: Check for specific error messages related to security policies

## Restoration Process

The backup script will:

1. Drop any newly created RLS policies
2. Disable RLS on tables if it was enabled during security enhancements
3. Drop any new triggers or functions that were added
4. Recreate the tables and functions as they were before security enhancements

Note: Any data stored in the tables will need to be backed up separately before restoring the schema if you want to preserve it.

## After Restoration

If you restore to the pre-security state, remember that your database will no longer have security policies enforcing data access controls. This means:

1. All users could potentially access all data
2. No validation will occur on data modifications
3. You'll need to implement alternative security measures at the application level
