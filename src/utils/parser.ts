import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AnalyzedAccount, ExistingAccount, PotentialAccount, JudgmentStatus } from '../types';

/**
 * Normalizes a company name for comparison:
 * - lowercase
 * - remove whitespace, punctuation
 * - remove common corporate suffixes (주식회사, (주), corp, inc, ltd, limited, co, gmbh, s.a., etc.)
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  let cleaned = name.toLowerCase().trim();
  // Remove common corporate markers
  cleaned = cleaned
    .replace(/\(주\)/g, '')
    .replace(/주식회사/g, '')
    .replace(/\b(inc\.?|corp\.?|ltd\.?|limited|co\.?|llc|gmbh|s\.a\.?|co\.,? ltd\.?)\b/gi, '')
    .replace(/[\s\-_.,()\[\]'"\/\\~]/g, '');
  return cleaned;
}

/**
 * Checks similarity or containment for spelling discrepancy detection
 */
function checkSpellingDiscrepancy(normalizedPotential: string, existingNames: { original: string; normalized: string }[]): { matched: boolean; existingName?: string } {
  if (!normalizedPotential || normalizedPotential.length < 2) return { matched: false };

  for (const ex of existingNames) {
    if (!ex.normalized) continue;
    // Exact match on normalized
    if (normalizedPotential === ex.normalized) {
      return { matched: true, existingName: ex.original };
    }
    // Substring containment if length >= 3
    if (normalizedPotential.length >= 3 && ex.normalized.length >= 3) {
      if (normalizedPotential.includes(ex.normalized) || ex.normalized.includes(normalizedPotential)) {
        // Ensure it's not a trivial tiny substring match
        const minLen = Math.min(normalizedPotential.length, ex.normalized.length);
        const maxLen = Math.max(normalizedPotential.length, ex.normalized.length);
        if (minLen / maxLen >= 0.5) {
          return { matched: true, existingName: ex.original };
        }
      }
    }
  }
  return { matched: false };
}

/**
 * Analyzes potential accounts against existing accounts master
 */
export function analyzeAccounts(
  potentials: PotentialAccount[],
  existingMasters: ExistingAccount[]
): AnalyzedAccount[] {
  // Precompute normalized existing names
  const existingMap = new Map<string, string>(); // normalized -> original
  const existingList: { original: string; normalized: string }[] = [];

  existingMasters.forEach(ex => {
    if (ex.company_name) {
      const norm = normalizeCompanyName(ex.company_name);
      if (norm) {
        existingMap.set(norm, ex.company_name);
        existingList.push({ original: ex.company_name, normalized: norm });
      }
    }
  });

  // Check duplicate counts in potential accounts
  const nameCountMap = new Map<string, number>();
  potentials.forEach(p => {
    const rawName = (p.company_name || '').trim();
    if (rawName) {
      const norm = normalizeCompanyName(rawName);
      nameCountMap.set(norm, (nameCountMap.get(norm) || 0) + 1);
    }
  });

  return potentials.map((p, idx) => {
    const rawName = (p.company_name || '').trim();
    const accountId = p.account_id || `ACC-${String(idx + 1).padStart(3, '0')}`;
    const country = (p.country || '').trim();
    const application = (p.application || '').trim();
    const contactEmail = (p.contact_email || '').trim();

    // 1. Data error check
    if (!rawName || rawName === '') {
      return {
        ...p,
        account_id: accountId,
        status: '데이터 오류' as JudgmentStatus,
        isDuplicate: false,
        isSpellingDiscrepancy: false,
        errorReason: '기업명(company_name) 누락 또는 공백'
      };
    }

    const normPotential = normalizeCompanyName(rawName);
    const dupCount = nameCountMap.get(normPotential) || 1;
    const isDuplicate = dupCount > 1;

    // 2. Exact match check
    if (existingMap.has(normPotential)) {
      const matchedName = existingMap.get(normPotential)!;
      // Check if it's exact string or spelling discrepancy
      const isExact = rawName.toLowerCase() === matchedName.toLowerCase();
      return {
        ...p,
        account_id: accountId,
        company_name: rawName,
        country: country || '기타',
        application: application || '미분류',
        contact_email: contactEmail,
        status: '기존거래' as JudgmentStatus,
        matchedExistingName: matchedName,
        isDuplicate,
        duplicateGroupCount: dupCount,
        isSpellingDiscrepancy: !isExact,
        discrepancyReason: !isExact ? `기존 마스터(${matchedName})와 표기형식 상이` : undefined
      };
    }

    // 3. Spelling discrepancy / similarity check against existing masters
    const check = checkSpellingDiscrepancy(normPotential, existingList);
    if (check.matched && check.existingName) {
      return {
        ...p,
        account_id: accountId,
        company_name: rawName,
        country: country || '기타',
        application: application || '미분류',
        contact_email: contactEmail,
        status: '기존거래' as JudgmentStatus,
        matchedExistingName: check.existingName,
        isDuplicate,
        duplicateGroupCount: dupCount,
        isSpellingDiscrepancy: true,
        discrepancyReason: `유사 표기 감지 (기존: ${check.existingName})`
      };
    }

    // 4. Otherwise -> 미거래 (타겟)
    return {
      ...p,
      account_id: accountId,
      company_name: rawName,
      country: country || '기타',
      application: application || '미분류',
      contact_email: contactEmail,
      status: '미거래(타겟)' as JudgmentStatus,
      isDuplicate,
      duplicateGroupCount: dupCount,
      isSpellingDiscrepancy: false
    };
  });
}

/**
 * Parses uploaded file (CSV or XLSX) into raw object array
 */
export async function parseUploadedFile(file: File): Promise<any[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error('지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드해주세요.');
  }
}

/**
 * Converts text paste (CSV or tab-delimited) into object array
 */
export function parseTextPaste(text: string): any[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Use PapaParse to parse text
  const result = Papa.parse(trimmed, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.data && result.data.length > 0) {
    return result.data;
  }
  return [];
}
