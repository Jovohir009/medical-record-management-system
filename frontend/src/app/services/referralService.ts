import { Referral } from "../types/domain";
import { apiRequest } from "./apiClient";
import { mapReferral } from "./mappers";

export async function getReferralHistory() {
  const rows = await apiRequest<any[]>("/referrals/history");
  return rows.map(mapReferral);
}

export async function getPatientReferrals(patientId: string) {
  const rows = await apiRequest<any[]>(
    `/referrals/patient/${encodeURIComponent(patientId)}`,
  );

  return rows.map(mapReferral);
}

export async function createReferral(payload: Record<string, unknown>) {
  const row = await apiRequest<any>("/referrals", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapReferral(row);
}

export async function updateReferralStatus(
  id: string,
  status: Referral["status"],
) {
  const row = await apiRequest<any>(`/referrals/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return mapReferral(row);
}
