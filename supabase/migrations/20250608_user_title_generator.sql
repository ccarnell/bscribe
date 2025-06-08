-- Migration for user title generator and voting system
-- Create tables for user-generated titles and votes

-- Table for user-generated content (separate from admin book_generations)
create table user_generated_titles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  generated_at timestamptz default now(),
  submitter_ip text,
  is_approved boolean default true,
  vote_count integer default 0
);

-- Table for tracking votes
create table title_votes (
  id uuid primary key default gen_random_uuid(),
  title_id uuid references user_generated_titles(id),
  voter_ip text,
  voted_at timestamptz default now(),
  unique(title_id, voter_ip)
);

-- Create indexes for performance
create index idx_user_generated_titles_generated_at on user_generated_titles(generated_at);
create index idx_title_votes_title_id on title_votes(title_id);
create index idx_title_votes_voter_ip on title_votes(voter_ip);

-- Create function for updating vote count
create or replace function update_vote_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update user_generated_titles
    set vote_count = vote_count + 1
    where id = NEW.title_id;
  elsif (TG_OP = 'DELETE') then
    update user_generated_titles
    set vote_count = vote_count - 1
    where id = OLD.title_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- Create trigger for vote count updates
create trigger vote_count_trigger
after insert or delete on title_votes
for each row
execute function update_vote_count();

-- Create function for rate limiting by IP
create or replace function check_user_generation_rate_limit(
  p_submitter_ip text,
  p_max_per_day integer default 3
)
returns boolean as $$
declare
  generation_count integer;
begin
  select count(*)
  into generation_count
  from user_generated_titles
  where submitter_ip = p_submitter_ip
  and generated_at > now() - interval '1 day';
  
  return generation_count < p_max_per_day;
end;
$$ language plpgsql;

-- Function to check global rate limit
create or replace function check_global_generation_rate_limit(
  p_max_per_hour integer default 100
)
returns boolean as $$
declare
  global_count integer;
begin
  select count(*)
  into global_count
  from user_generated_titles
  where generated_at > now() - interval '1 hour';
  
  return global_count < p_max_per_hour;
end;
$$ language plpgsql;