/*
  # Fix Photos Table Foreign Key Constraint

  1. Changes
    - Drop the incorrect foreign key constraint that references non-existent 'users' table
    - Add correct foreign key constraint that references 'auth.users' table
    - This allows photos to be properly linked to authenticated users

  2. Security
    - Maintains data integrity by ensuring user_id values are valid
    - Enables CASCADE delete to clean up photos when users are deleted
*/

-- Drop the incorrect foreign key constraint
ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_user_id_fkey;

-- Add the correct foreign key constraint referencing auth.users
ALTER TABLE photos ADD CONSTRAINT photos_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;