-- Migration to fix vote count trigger
-- Prevent negative vote counts

-- Drop existing function
DROP FUNCTION IF EXISTS update_vote_count CASCADE;

-- Create updated function for updating vote count with safeguard for negative counts
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE user_generated_titles
    SET vote_count = vote_count + 1
    WHERE id = NEW.title_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE user_generated_titles
    SET vote_count = GREATEST(0, vote_count - 1)  -- Ensure vote_count never goes below 0
    WHERE id = OLD.title_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER vote_count_trigger
AFTER INSERT OR DELETE ON title_votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_count();

-- Fix any existing negative vote counts
UPDATE user_generated_titles
SET vote_count = 0
WHERE vote_count < 0;