
# Database Restore Instructions

If you need to restore the database to its original state before the security enhancements, follow these steps:

1. Open the Supabase Dashboard for your project
2. Go to the SQL Editor
3. Copy and paste the contents of `database_backup.sql` into the SQL Editor
4. Run the script

Before running the restore script, you may want to:

1. Drop any newly created RLS policies
2. Disable RLS on tables if it was enabled during security enhancements
3. Drop any new triggers or functions that were added

Note: The backup script recreates the tables and functions as they were before security enhancements. Any data stored in the tables will need to be backed up separately before restoring the schema if you want to preserve it.
