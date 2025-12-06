----------------------------------------------------
-- TRAVEL_GROUP - Nhóm đi du lịch
----------------------------------------------------
CREATE TABLE IF NOT EXISTS travel_group (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_group varchar(6) UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  destination text,
  cover_image text,
  max_members integer DEFAULT 10,
  is_public boolean DEFAULT true,
  start_date date,
  end_date date,
  created_by varchar(6) REFERENCES traveller(id_user),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- GROUP_MEMBER - Thành viên nhóm
----------------------------------------------------
CREATE TABLE IF NOT EXISTS group_member (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_group varchar(6) REFERENCES travel_group(id_group) ON DELETE CASCADE,
  id_user varchar(6) REFERENCES traveller(id_user) ON DELETE CASCADE,
  role text DEFAULT 'member', -- 'admin', 'member'
  joined_at timestamptz DEFAULT now(),
  UNIQUE(id_group, id_user)
);

-- Enable RLS
ALTER TABLE travel_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_member ENABLE ROW LEVEL SECURITY;

-- Policies for travel_group
DROP POLICY IF EXISTS "Public can view public groups" ON travel_group;
CREATE POLICY "Public can view public groups" ON travel_group
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON travel_group;
CREATE POLICY "Authenticated users can create groups" ON travel_group
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Group creator can update" ON travel_group;
CREATE POLICY "Group creator can update" ON travel_group
  FOR UPDATE USING (
    created_by IN (
      SELECT id_user FROM account WHERE email = auth.email()
    )
  );

-- Policies for group_member
DROP POLICY IF EXISTS "Anyone can view group members" ON group_member;
CREATE POLICY "Anyone can view group members" ON group_member
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join groups" ON group_member;
CREATE POLICY "Authenticated users can join groups" ON group_member
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can leave groups" ON group_member;
CREATE POLICY "Users can leave groups" ON group_member
  FOR DELETE USING (
    id_user IN (
      SELECT id_user FROM account WHERE email = auth.email()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_group_created_by ON travel_group(created_by);
CREATE INDEX IF NOT EXISTS idx_group_member_group ON group_member(id_group);
CREATE INDEX IF NOT EXISTS idx_group_member_user ON group_member(id_user);

