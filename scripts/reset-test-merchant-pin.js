#!/usr/bin/env node
/*
 * PLZ-091 — Reset the test merchant's PIN for agent QA workflows.
 *
 * Phone: +212666666666
 * PIN  : 1234
 *
 * IMPLEMENTATION NOTES — merchant PIN storage.
 *
 * The phone+PIN UX (app/auth/pin-login/actions.ts) is backed by Supabase
 * email+password auth. A deterministic synthetic email is derived from
 * the phone:
 *   `${phone.replace('+','')}@plaza-merchant.internal`
 *     e.g. 212666666666@plaza-merchant.internal
 * The PIN is the password on that auth user. The merchants.pin_hash
 * column referenced in migration 20260408000001 was later dropped
 * (see .agents/backend/memory.md — "Dropped 9 columns").
 *
 * The GoTrue `updateUserById` admin API enforces a 6-char minimum
 * password length, but the product PIN is 4 chars. Client-side signup
 * uses `createUser` which bypasses that check. To reset the password
 * to 4 chars on an EXISTING user we cannot use updateUserById. Instead
 * we direct-update auth.users.encrypted_password via the Supabase
 * Management API using pgcrypto's bcrypt (`crypt(pin, gen_salt('bf'))`),
 * matching the `$2a$10$...` format GoTrue itself stores.
 *
 * This is a QA/dev tool — refuses to run against production.
 * Reads credentials from .env.local.
 *   SUPABASE_ACCESS_TOKEN  — personal token for api.supabase.com
 *   SUPABASE_PROJECT_REF   — optional override, defaults to active ref
 *   SUPABASE_SERVICE_ROLE_KEY — for merchants-table operations
 *
 * Usage:
 *   node scripts/reset-test-merchant-pin.js
 */

const fs = require('fs');
const path = require('path');

const TEST_PHONE = '+212666666666';
const TEST_PIN = '1234';
const SYNTHETIC_EMAIL = `${TEST_PHONE.replace('+', '')}@plaza-merchant.internal`;
const DEFAULT_PROJECT_REF = 'hnheztkadfgcqsimfzsl';

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

async function runManagementQuery(projectRef, accessToken, query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'reset-test-merchant-pin.js refuses to run with NODE_ENV=production. ' +
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
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || DEFAULT_PROJECT_REF;
  if (!url || !serviceKey || !accessToken) {
    console.error(
      'Missing one of NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ' +
        'SUPABASE_ACCESS_TOKEN in .env.local',
    );
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1 — ensure an auth.users row exists for the synthetic email.
  // Short password is only accepted by createUser; it is NOT accepted by
  // updateUserById, so we branch: create if missing, direct-SQL update
  // if present.
  let userId;
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error('Failed to list users:', listErr.message);
    process.exit(1);
  }
  const existing = listData.users.find(
    (u) => (u.email ?? '').toLowerCase() === SYNTHETIC_EMAIL.toLowerCase(),
  );

  if (existing) {
    userId = existing.id;
    // Reset password via direct UPDATE on auth.users.encrypted_password
    // using pgcrypto bcrypt — GoTrue stores $2a$10$... and crypt(..., gen_salt('bf'))
    // produces a verify-compatible hash.
    const quotedPin = TEST_PIN.replace(/'/g, "''");
    const quotedEmail = SYNTHETIC_EMAIL.replace(/'/g, "''");
    const result = await runManagementQuery(
      projectRef,
      accessToken,
      `UPDATE auth.users
         SET encrypted_password = crypt('${quotedPin}', gen_salt('bf')),
             email_confirmed_at = COALESCE(email_confirmed_at, now()),
             updated_at = now()
       WHERE email = '${quotedEmail}'
       RETURNING id;`,
    );
    if (!Array.isArray(result) || result.length === 0) {
      console.error('Password update returned no rows — aborting.');
      process.exit(1);
    }
    console.log(`auth.users password reset: ${userId}`);
  } else {
    // createUser accepts short passwords (no policy enforcement on admin create).
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email: SYNTHETIC_EMAIL,
        password: TEST_PIN,
        email_confirm: true,
      });
    if (createErr || !created.user) {
      console.error('Failed to create auth user:', createErr?.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`auth.users row created: ${userId}`);
  }

  // Step 2 — ensure merchants row has the phone number set so the
  // returning-user check during login works. Safe to re-run.
  const { data: merchantRow, error: merchFetchErr } = await supabase
    .from('merchants')
    .select('id, user_id, phone')
    .eq('user_id', userId)
    .maybeSingle();
  if (merchFetchErr) {
    console.error('Failed to fetch merchants row:', merchFetchErr.message);
    process.exit(1);
  }

  if (merchantRow) {
    if (merchantRow.phone !== TEST_PHONE) {
      const { error: phoneErr } = await supabase
        .from('merchants')
        .update({ phone: TEST_PHONE })
        .eq('id', merchantRow.id);
      if (phoneErr) {
        console.error('Failed to set merchants.phone:', phoneErr.message);
        process.exit(1);
      }
      console.log(`merchants.phone updated on row ${merchantRow.id}`);
    } else {
      console.log(`merchants row present (id=${merchantRow.id}, phone matches)`);
    }
  } else {
    console.log(
      `No merchants row for user ${userId}. Onboarding may not be complete yet —` +
        ' log in via /auth/login to trigger the merchant-creation flow.',
    );
  }

  console.log('');
  console.log(
    `PIN reset to ${TEST_PIN} for ${TEST_PHONE} — use for agent QA only`,
  );
  console.log('');
  console.log('Go to: http://localhost:3000/auth/login');
  console.log(`  Phone : ${TEST_PHONE}`);
  console.log(`  PIN   : ${TEST_PIN}`);
  console.log('');
  console.log('QA/dev use only — never run against production.');
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
