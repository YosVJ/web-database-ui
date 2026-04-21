# Supabase Security Audit

## Project
Synercore Web Database UI

## Date
2026-04-20

## Scope
This security hardening covers the following tables:

- `profiles`
- `user_companies`
- `purchase_requests`

## Current Data Model
This project currently uses a text-based `company_id` model rather than a normalized `companies` table.

That means tenant isolation is currently enforced by:

- `user_companies.user_id`
- `user_companies.company_id`
- `purchase_requests.company_id`

## Key Security Decisions
- Frontend uses Supabase publishable key only
- No secret key is allowed in browser code
- Row Level Security (RLS) is enabled on all app-relevant tables
- Company access is enforced by `user_companies`
- `super_admin` can bypass company restrictions where intended
- Users cannot elevate their own `profiles.role`

## Frontend / DB Alignment Notes
### profiles
The frontend auth flow writes these fields to `profiles`:
- `id`
- `email`
- `full_name`
- `provider`

So `profiles` must contain:
- `email`
- `provider`

### purchase_requests
The database uses snake_case:
- `pr_no`
- `due_at`
- `blocked_reason`
- `next_actor`
- `updated_at`

The frontend originally expected camelCase values, so the frontend query was adjusted to map DB fields into UI-friendly names.

## What This Migration Adds
- missing `profiles.email`
- missing `profiles.provider`
- RLS enablement
- helper auth functions
- policies for all relevant tables
- triggers to block role escalation
- updated_at triggers
- supporting indexes

## Out of Scope
These tables are not part of this security pass:
- `messages`
- `webhook_events`
- `webhook_secrets`

They may be reviewed later if they become part of the application flow.

## Remaining Recommended Improvements
1. Add a normalized `companies` table later
2. Add audit trail tables for approval actions
3. Move dashboard aggregation into a secure SQL view or RPC
4. Review storage policies if document uploads are introduced
5. Add stricter role/permission segmentation beyond `super_admin`

## Validation Checklist
- [ ] publishable key only in frontend
- [ ] no secret key in repo
- [ ] RLS enabled on `profiles`
- [ ] RLS enabled on `user_companies`
- [ ] RLS enabled on `purchase_requests`
- [ ] normal user can only see own profile
- [ ] normal user can only see assigned company records
- [ ] normal user cannot escalate role
- [ ] super admin behavior tested