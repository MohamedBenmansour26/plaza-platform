#!/usr/bin/env node
/*
 * PLZ-060 founder-admin activation.
 *
 * Founder never touches Supabase manually (see .agents/pm/CLAUDE.md).
 * This script, run by an operator (Anas/PM) with service-role creds, does:
 *   1. Ensures an auth.users row exists for the founder email (creates it
 *      with email_confirm = true so magic-link works immediately).
 *   2. Upserts the corresponding admin_users row (role = 'admin', active).
 *
 * Idempotent: safe to re-run. Reads creds from .env.local.
 *
 * Usage:
 *   node scripts/activate-admin.js                 # uses default founder email
 *   node scripts/activate-admin.js someone@x.com   # override email
 *
 * After running, the founder visits /admin/login, enters the email, clicks
 * the magic link — middleware then lets them into /admin.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_FOUNDER_EMAIL = 'm.benmansour2017@gmail.com';

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1).replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
    );
    process.exit(1);
  }

  const email = (process.argv[2] || DEFAULT_FOUNDER_EMAIL).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Invalid email: ${email}`);
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1 — ensure auth.users row. listUsers is paginated; use filter.
  let userId;
  {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) {
      console.error('Failed to list users:', error.message);
      process.exit(1);
    }
    const existing = data.users.find(
      (u) => (u.email ?? '').toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      userId = existing.id;
      console.log(`auth.users row exists: ${userId}`);
    } else {
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
        });
      if (createErr || !created.user) {
        console.error('Failed to create auth user:', createErr?.message);
        process.exit(1);
      }
      userId = created.user.id;
      console.log(`auth.users row created: ${userId}`);
    }
  }

  // Step 2 — upsert admin_users. Unique index is on user_id.
  const { error: upsertErr } = await supabase.from('admin_users').upsert(
    {
      user_id: userId,
      email,
      role: 'admin',
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (upsertErr) {
    console.error('Failed to upsert admin_users:', upsertErr.message);
    process.exit(1);
  }

  console.log(`admin_users row active for ${email} (user_id=${userId})`);
  console.log('\nDone. Founder can now sign in at /admin/login with this email.');
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
