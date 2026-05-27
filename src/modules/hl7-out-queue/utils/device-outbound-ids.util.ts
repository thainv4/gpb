export function buildBlockId(receptionCode: string, blockNumber: number): string {
    return `${receptionCode}A.${blockNumber}`;
}

export function buildSlideId(receptionCode: string, blockNumber: number, slideNumber: number): string {
    return `${receptionCode}A.${blockNumber}.${slideNumber}`;
}

export function buildSpecimenId(receptionCode: string): string {
    return `${receptionCode}A`;
}
