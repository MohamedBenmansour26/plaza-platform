#!/usr/bin/env node
/*
 * PLZ-091 — Admin user seed script.
 *
 * Idempotently provisions the admin login path for agent worktrees:
 *   1. Creates (or finds) an auth.users row for the admin email.
 *   2. Sets/updates the password on that auth user.
 *   3. Upserts the corresponding admin_users row (role=admin, is_active=true).
 *
 * This is a QA/dev tool — refuses to run against production.
 * Reads credentials from .env.local (NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY).
 *
 * Usage:
 *   node scripts/seed-admin-user.js
 *   ADMIN_SEED_PASSWORD=MyOwnPw! node scripts/seed-admin-user.js
 *
 * Background: scripts/admin-set-password.js only updates the password and
 * errors when the auth.users row is missing. This script covers the full
 * provisioning flow end-to-end so agents can log into /admin/* from a
 * fresh worktree without manual Supabase intervention.
 */

const fs = require('fs');
const path = require('path');

const ADMIN_EMAIL = 'm.benmansour2017@gmail.com';
const DEFAULT_PASSWORD = 'PlazaDev!2026';

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
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'seed-admin-user.js refuses to run with NODE_ENV=production. ' +
        'This is a QA/dev tool only.',
    );
  }

  loadEnvLocal();

  // Agent machines hit an SSL intercepting proxy that rejects the Supabase
  // cert. Matches the pattern used in lib/notion.ts for dev-only access.
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
    );
    process.exit(1);
  }

  const password = process.env.ADMIN_SEED_PASSWORD || DEFAULT_PASSWORD;
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1 — ensure auth.users row exists and password is set.
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
      (u) => (u.email ?? '').toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    );
    if (existing) {
      userId = existing.id;
      const { error: updateErr } = await supabase.auth.admin.updateUserById(
        userId,
        { password, email_confirm: true },
      );
      if (updateErr) {
        console.error('Failed to update auth user:', updateErr.message);
        process.exit(1);
      }
      console.log(`auth.users row updated: ${userId}`);
    } else {
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password,
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

  // Step 2 — upsert admin_users row (role=admin, is_active=true).
  // Matches the shape created by scripts/activate-admin.js.
  const { error: upsertErr } = await supabase.from('admin_users').upsert(
    {
      user_id: userId,
      email: ADMIN_EMAIL,
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
  console.log(`admin_users row active for ${ADMIN_EMAIL} (user_id=${userId})`);

  console.log('');
  console.log('Admin seeded successfully.');
  console.log('');
  console.log('  Email    :', ADMIN_EMAIL);
  console.log('  Password :', password);
  console.log('');
  console.log('Go to: http://localhost:3000/admin/login');
  console.log('Click "Connexion par mot de passe" and enter the credentials above.');
  console.log('');
  console.log('QA/dev use only — never run against production.');
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
