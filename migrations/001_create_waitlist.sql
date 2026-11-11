create table if not exists waitlist_emails (
  email text primary key,
  signed_up_wib text not null,
  created_at timestamptz not null default now()
);
