/**
 * Map HIS patient gender to HL7 administrative sex (M/F).
 * Prefers PATIENT_GENDER_ID (HIS MOS: 1 = Nữ, 2 = Nam); falls back to PATIENT_GENDER_NAME.
 */
export function mapPatientGenderToHl7(
    genderId?: number | null,
    genderName?: string | null,
): string | undefined {
    if (genderId === 2) {
        return 'M';
    }
    if (genderId === 1) {
        return 'F';
    }

    const normalized = genderName?.trim().toLowerCase();
    if (!normalized) {
        return undefined;
    }
    if (normalized === 'nam') {
        return 'M';
    }
    if (normalized === 'nữ' || normalized === 'nu') {
        return 'F';
    }

    return undefined;
}
