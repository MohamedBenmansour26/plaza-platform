'use server';

import { redirect } from 'next/navigation';
import {
  approveDriverAction,
  rejectDriverAction,
  resubmitDocumentAction,
} from '@/app/admin/drivers/[id]/actions';

export type DocumentKey = 'license' | 'insurance' | 'id_front' | 'id_back';

export type ActionResult = { ok: true } | { error: string };

const DOC_FIELD: Record<DocumentKey, 'license_approved' | 'insurance_approved' | 'id_front_approved' | 'id_back_approved'> = {
  license: 'license_approved',
  insurance: 'insurance_approved',
  id_front: 'id_front_approved',
  id_back: 'id_back_approved',
};

function normalize(
  res: { success: true } | { success: false; error: string },
): ActionResult {
  return res.success ? { ok: true } : { error: res.error };
}

export async function approveDriver(driverId: string): Promise<ActionResult> {
  return normalize(await approveDriverAction(driverId));
}

export async function approveDriverWithOverride(
  driverId: string,
): Promise<ActionResult> {
  return normalize(await approveDriverAction(driverId));
}

export async function rejectDriver(
  driverId: string,
  reason: string,
): Promise<ActionResult> {
  return normalize(await rejectDriverAction(driverId, reason));
}

export async function requestDocResubmit(
  driverId: string,
  doc: DocumentKey,
  reason: string,
): Promise<ActionResult> {
  return normalize(await resubmitDocumentAction(driverId, DOC_FIELD[doc], reason));
}

// Per-doc rejection maps to resubmit: schema has a binary per-doc approved
// flag + a driver-level approval_status. No distinct per-doc rejected state
// at the DB level; UI's rejected/resubmit distinction is cosmetic for v1.
export async function rejectSingleDoc(
  driverId: string,
  doc: DocumentKey,
  reason: string,
): Promise<ActionResult> {
  return normalize(await resubmitDocumentAction(driverId, DOC_FIELD[doc], reason));
}

export async function redirectToQueue(): Promise<never> {
  redirect('/admin/drivers/pending');
}
