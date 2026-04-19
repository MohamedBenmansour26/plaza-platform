'use server';

// TODO (Youssef swap): this file is a STUB. Once
// `plz-060-061-backend` lands, delete the stub implementations below
// and re-export the real server actions. Signatures are kept stable so
// the UI components (`DriverDetailClient`, `MobileDetail`) don't need to
// change on merge:
//
//   import {
//     approveDriver,
//     rejectDriver,
//     requestDocResubmit,
//     rejectSingleDoc,
//     getSignedDocUrl,
//   } from '@/lib/admin-auth';  // or a dedicated driver-actions module

import { redirect } from 'next/navigation';

export type DocumentKey = 'license' | 'insurance' | 'id_front' | 'id_back';

export type ActionResult = { ok: true } | { error: string };

export async function approveDriver(_driverId: string): Promise<ActionResult> {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}

export async function approveDriverWithOverride(
  _driverId: string,
): Promise<ActionResult> {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}

export async function rejectDriver(
  _driverId: string,
  reason: string,
): Promise<ActionResult> {
  if (reason.trim().length < 10) {
    return { error: 'reason_too_short' };
  }
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}

export async function requestDocResubmit(
  _driverId: string,
  _doc: DocumentKey,
  reason: string,
): Promise<ActionResult> {
  if (reason.trim().length < 5) {
    return { error: 'reason_too_short' };
  }
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}

export async function rejectSingleDoc(
  _driverId: string,
  _doc: DocumentKey,
  reason: string,
): Promise<ActionResult> {
  if (reason.trim().length < 5) {
    return { error: 'reason_too_short' };
  }
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}

export async function redirectToQueue(): Promise<never> {
  redirect('/admin/drivers/pending');
}
