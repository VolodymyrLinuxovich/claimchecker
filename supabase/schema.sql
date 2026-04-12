-- ClaimCheck — run in Supabase SQL editor (single-workspace hackathon app; no RLS until you add auth).

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  jurisdiction text not null,
  patent_draft text not null,
  supporting_context text,
  executive_summary jsonb not null,
  issues jsonb not null,
  questions_to_resolve jsonb not null,
  suggested_revision_instructions jsonb not null,
  recommended_email_to_counsel text not null,
  high_risk_count integer not null default 0,
  missing_support_count integer not null default 0,
  draft_email_ready boolean not null default false
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  owner text not null,
  title text not null,
  status text not null default 'ready'
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);
create index if not exists action_items_review_id_idx on public.action_items (review_id);
