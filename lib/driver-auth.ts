/**
 * Supabase enforces a minimum password length of 6 characters.
 * Driver PINs are 4 digits, so we pad them before storing in Supabase auth.
 * The user always interacts with their 4-digit PIN — the padding is invisible.
 * MUST be applied consistently in both pin-setup and pin-login actions.
 */
export function pinToPassword(pin: string): string {
  return `drv_${pin}_plz`;
}

/**
 * Converts a driver E.164 phone number to the synthetic email used in Supabase auth.
 * Drivers have no real email — we derive one from their phone so we can use
 * signInWithPassword (OTP-based auth is only used for the first-time PIN setup flow).
 * MUST match exactly in both pin-setup (createUser) and pin-login (signInWithPassword).
 */
export function driverSyntheticEmail(phone: string): string {
  return `${phone.replace('+', '')}@plaza-driver.internal`;
}
