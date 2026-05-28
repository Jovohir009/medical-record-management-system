import * as diagnosisRepository from "../repositories/diagnosisRepository";

function normalizeDiagnosisInput(input: any) {
  return {
    patient_id: Number(input.patient_id ?? input.patientId),
    doctor_id:
      input.doctor_id || input.doctorId
        ? Number(input.doctor_id ?? input.doctorId)
        : null,
    icd_code: input.icd_code ?? input.icdCode ?? null,
    condition_name: input.condition_name ?? input.conditionName,
    severity: input.severity,
    status: input.status ?? "active",
    diagnosed_date:
      input.diagnosed_date ??
      input.diagnosedDate ??
      new Date().toISOString().slice(0, 10),
    notes: input.notes ?? null,
  };
}

export async function listDiagnoses() {
  return diagnosisRepository.getDiagnoses();
}

export async function getDiagnosis(id: number) {
  return diagnosisRepository.getDiagnosisById(id);
}

export async function addDiagnosis(input: any) {
  return diagnosisRepository.createDiagnosis(normalizeDiagnosisInput(input));
}

export async function editDiagnosis(id: number, input: any) {
  const normalized: any = normalizeDiagnosisInput(input);

  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined || Number.isNaN(normalized[key])) {
      delete normalized[key];
    }
  });

  return diagnosisRepository.updateDiagnosis(id, normalized);
}

export async function removeDiagnosis(id: number) {
  return diagnosisRepository.deleteDiagnosis(id);
}
