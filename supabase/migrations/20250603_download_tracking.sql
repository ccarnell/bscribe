-- Simple download tracking table
create table download_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  book_title text,
  customer_email text,
  downloaded_at timestamptz default now()
);

-- Simple index for lookups
create index idx_download_logs_session on download_logs(session_id);
create index idx_download_logs_email on download_logs(customer_email);