#!/usr/bin/env node
/**
 * Set (or reset) the password for the admin user.
 * Usage: node scripts/admin-set-password.js [new-password]
 * If no password is provided, a random one is generated and printed.
 */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const ADMIN_EMAIL = 'm.benmansour2017@gmail.com';
  const newPassword = process.argv[2] || Math.random().toString(36).slice(2, 10) + 'Plaza1!';

  // Find the user by email.
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error('listUsers error:', listErr.message); process.exit(1); }

  const user = users.find((u) => u.email === ADMIN_EMAIL);
  if (!user) {
    console.error(`No auth.users row for ${ADMIN_EMAIL}.`);
    console.error('Run `npm run seed:admin` (scripts/seed-admin-user.js) first — it provisions the full admin row end-to-end.');
    process.exit(1);
  }

  const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
  if (updateErr) { console.error('updateUserById error:', updateErr.message); process.exit(1); }

  console.log('');
  console.log('Admin password set successfully.');
  console.log('');
  console.log('  Email   :', ADMIN_EMAIL);
  console.log('  Password:', newPassword);
  console.log('');
  console.log('Go to: http://localhost:3000/admin/login');
  console.log('Click "Connexion par mot de passe" and enter the credentials above.');
  console.log('');
}

main().catch((err) => { console.error(err); process.exit(1); });
