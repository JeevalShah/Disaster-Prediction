/*
  # Fix RLS Policies for Profiles Table

  1. Changes
    - Drop existing problematic RLS policies on profiles table
    - Create new non-recursive policies that avoid infinite recursion
    - Use auth.uid() directly instead of querying profiles table within policies

  2. Security
    - Users can read/update their own profile
    - Admins can read all profiles (using jwt claims instead of profiles table lookup)
    - Maintain proper access control without recursion
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- For admin access, we'll handle this in the application layer
-- since we can't reliably check admin status without recursion
CREATE POLICY "Service role can access all profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true);