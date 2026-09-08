export type JudgmentStatus = '기존거래' | '미거래(타겟)' | '데이터 오류';

export interface ExistingAccount {
  ex_id: string;
  company_name: string;
  country?: string;
  notes?: string;
}

export interface PotentialAccount {
  account_id: string;
  company_name: string;
  country: string;
  application: string;
  contact_email: string;
  contact_person?: string;
  phone?: string;
  [key: string]: any;
}

export interface AnalyzedAccount extends PotentialAccount {
  status: JudgmentStatus;
  matchedExistingName?: string;
  isDuplicate: boolean;
  duplicateGroupCount?: number;
  isSpellingDiscrepancy: boolean;
  discrepancyReason?: string;
  errorReason?: string;
}

export interface FilterState {
  country: string;
  application: string;
  status: string;
  searchTerm: string;
  showDuplicatesOnly: boolean;
  showDiscrepanciesOnly: boolean;
}
