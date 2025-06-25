-- Add industry support to book_generations table
ALTER TABLE book_generations ADD COLUMN IF NOT EXISTS industry text DEFAULT 'self-help';

-- Add editing fields for admin functionality
ALTER TABLE book_generations ADD COLUMN IF NOT EXISTS title_locked boolean DEFAULT false;
ALTER TABLE book_generations ADD COLUMN IF NOT EXISTS chapters_locked boolean DEFAULT false;
ALTER TABLE book_generations ADD COLUMN IF NOT EXISTS last_edited_at timestamptz;
ALTER TABLE book_generations ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES profiles(id);

-- user_id column already exists, so we skip adding it

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_book_generations_industry ON book_generations(industry);
CREATE INDEX IF NOT EXISTS idx_book_generations_user_id ON book_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_book_generations_status ON book_generations(status);

-- Update existing records to have default industry
UPDATE book_generations SET industry = 'self-help' WHERE industry IS NULL;
