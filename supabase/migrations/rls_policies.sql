----------------------------------------------------
-- RLS Policies for Authentication & User Management
-- Drop existing policies first, then create new ones
----------------------------------------------------

-- USERS table policies
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
CREATE POLICY "Users can insert their own record"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Public can read users" ON users;
CREATE POLICY "Public can read users"
ON users FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO authenticated
USING (true);

-- ACCOUNT table policies
DROP POLICY IF EXISTS "Users can insert their own account" ON account;
CREATE POLICY "Users can insert their own account"
ON account FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own account" ON account;
CREATE POLICY "Users can read their own account"
ON account FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can update their own account" ON account;
CREATE POLICY "Users can update their own account"
ON account FOR UPDATE
TO authenticated
USING (true);

-- TRAVELLER table policies
DROP POLICY IF EXISTS "Users can insert their own traveller record" ON traveller;
CREATE POLICY "Users can insert their own traveller record"
ON traveller FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own traveller data" ON traveller;
CREATE POLICY "Users can read their own traveller data"
ON traveller FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Public can read traveller" ON traveller;
CREATE POLICY "Public can read traveller"
ON traveller FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Users can update their own traveller data" ON traveller;
CREATE POLICY "Users can update their own traveller data"
ON traveller FOR UPDATE
TO authenticated
USING (true);

-- DESTINATION table policies
DROP POLICY IF EXISTS "Anyone can read destinations" ON destination;
CREATE POLICY "Anyone can read destinations"
ON destination FOR SELECT
TO public
USING (true);

-- POST table policies
DROP POLICY IF EXISTS "Anyone can read posts" ON post;
CREATE POLICY "Anyone can read posts"
ON post FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON post;
CREATE POLICY "Authenticated users can create posts"
ON post FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own posts" ON post;
CREATE POLICY "Users can update their own posts"
ON post FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can delete their own posts" ON post;
CREATE POLICY "Users can delete their own posts"
ON post FOR DELETE
TO authenticated
USING (true);

-- TRAVELLER_DESTINATION table policies
DROP POLICY IF EXISTS "Users can read traveller_destination" ON traveller_destination;
CREATE POLICY "Users can read traveller_destination"
ON traveller_destination FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Public can read traveller_destination" ON traveller_destination;
CREATE POLICY "Public can read traveller_destination"
ON traveller_destination FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Users can insert their own traveller_destination" ON traveller_destination;
CREATE POLICY "Users can insert their own traveller_destination"
ON traveller_destination FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own traveller_destination" ON traveller_destination;
CREATE POLICY "Users can delete their own traveller_destination"
ON traveller_destination FOR DELETE
TO authenticated
USING (true);

