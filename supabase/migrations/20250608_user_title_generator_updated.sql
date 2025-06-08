-- Migration for updated user title generator and voting system
-- Update rate limiting parameters

-- Drop existing rate limiting functions if they exist
DROP FUNCTION IF EXISTS check_user_generation_rate_limit;
DROP FUNCTION IF EXISTS check_global_generation_rate_limit;

-- Create updated function for rate limiting by IP - now 12 calls per day instead of 3
create or replace function check_user_generation_rate_limit(
  p_submitter_ip text,
  p_max_per_day integer default 12
)
returns boolean as $$
declare
  api_call_count integer;
begin
  select count(*)
  into api_call_count
  from api_usage
  where metadata->>'ip' = p_submitter_ip
  and endpoint = 'user-titles/generate'
  and timestamp > now() - interval '1 day';
  
  return api_call_count < p_max_per_day;
end;
$$ language plpgsql;

-- Function to check global rate limit - now 5000 per hour instead of 100
create or replace function check_global_generation_rate_limit(
  p_max_per_hour integer default 5000
)
returns boolean as $$
declare
  global_count integer;
begin
  select count(*)
  into global_count
  from api_usage
  where endpoint = 'user-titles/generate'
  and timestamp > now() - interval '1 hour';
  
  return global_count < p_max_per_hour;
end;
$$ language plpgsql;