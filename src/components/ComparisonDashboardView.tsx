import React, { useState, useMemo } from 'react';
import { AnalyzedAccount, FilterState, JudgmentStatus } from '../types';
import {
  Search,
  Filter,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Target,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ComparisonDashboardViewProps {
  analyzedData: AnalyzedAccount[];
  onSelectAccount: (account: AnalyzedAccount) => void;
  onGoToDataManagement: () => void;
}

export const ComparisonDashboardView: React.FC<ComparisonDashboardViewProps> = ({
  analyzedData,
  onSelectAccount,
  onGoToDataManagement,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    country: 'ALL',
    application: 'ALL',
    status: 'ALL',
    searchTerm: '',
    showDuplicatesOnly: false,
    showDiscrepanciesOnly: false,
  });

  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Extract unique countries and applications for filter dropdowns
  const countries = useMemo(() => {
    const set = new Set<string>();
    analyzedData.forEach(item => { if (item.country) set.add(item.country); });
    return Array.from(set).sort();
  }, [analyzedData]);

  const applications = useMemo(() => {
    const set = new Set<string>();
    analyzedData.forEach(item => { if (item.application) set.add(item.application); });
    return Array.from(set).sort();
  }, [analyzedData]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = analyzedData.length;
    let existing = 0;
    let target = 0;
    let error = 0;
    let duplicateCount = 0;
    let discrepancyCount = 0;

    analyzedData.forEach(item => {
      if (item.status === '기존거래') existing++;
      else if (item.status === '미거래(타겟)') target++;
      else if (item.status === '데이터 오류') error++;

      if (item.isDuplicate) duplicateCount++;
      if (item.isSpellingDiscrepancy) discrepancyCount++;
    });

    return { total, existing, target, error, duplicateCount, discrepancyCount };
  }, [analyzedData]);

  // Filtered data
  const filteredData = useMemo(() => {
    return analyzedData.filter(item => {
      // Status filter
      if (filters.status !== 'ALL' && item.status !== filters.status) return false;
      // Country filter
      if (filters.country !== 'ALL' && item.country !== filters.country) return false;
      // Application filter
      if (filters.application !== 'ALL' && item.application !== filters.application) return false;
      // Duplicates only
      if (filters.showDuplicatesOnly && !item.isDuplicate) return false;
      // Discrepancies only
      if (filters.showDiscrepanciesOnly && !item.isSpellingDiscrepancy) return false;
      // Search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const nameMatch = item.company_name?.toLowerCase().includes(term);
        const emailMatch = item.contact_email?.toLowerCase().includes(term);
        const contactMatch = item.contact_person?.toLowerCase().includes(term);
        if (!nameMatch && !emailMatch && !contactMatch) return false;
      }
      return true;
    });
  }, [analyzedData, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Copy filtered target list as tab-delimited text
  const handleCopyFilteredTargets = () => {
    const targets = filteredData.filter(item => item.status === '미거래(타겟)');
    if (targets.length === 0) {
      alert('복사할 미거래 타겟 데이터가 없습니다.');
      return;
    }

    const headers = ['기업명', '국가', '사용용도', '담당자', '연락처(Email)', '전화번호'];
    const rows = targets.map(t => [
      t.company_name,
      t.country,
      t.application,
      t.contact_person || '',
      t.contact_email || '',
      t.phone || ''
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Card */}
        <div
          onClick={() => setFilters(prev => ({ ...prev, status: 'ALL', showDuplicatesOnly: false, showDiscrepanciesOnly: false }))}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filters.status === 'ALL' && !filters.showDuplicatesOnly && !filters.showDiscrepanciesOnly
              ? 'border-blue-600 ring-2 ring-blue-600/20'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">전체 분석 대상</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-400 mt-1">기준일: 2026-08-27</div>
        </div>

        {/* Existing Card */}
        <div
          onClick={() => setFilters(prev => ({ ...prev, status: '기존거래', showDuplicatesOnly: false, showDiscrepanciesOnly: false }))}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filters.status === '기존거래' ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">기존 거래처</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.existing}</div>
          <div className="text-xs text-emerald-600/80 mt-1">
            {stats.total > 0 ? `${((stats.existing / stats.total) * 100).toFixed(1)}%` : '0%'} 비중
          </div>
        </div>

        {/* Target Card */}
        <div
          onClick={() => setFilters(prev => ({ ...prev, status: '미거래(타겟)', showDuplicatesOnly: false, showDiscrepanciesOnly: false }))}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filters.status === '미거래(타겟)' ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">미거래 타겟</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.target}</div>
          <div className="text-xs text-blue-600/80 mt-1">즉시 영업 공략 가능</div>
        </div>

        {/* Data Error Card */}
        <div
          onClick={() => setFilters(prev => ({ ...prev, status: '데이터 오류', showDuplicatesOnly: false, showDiscrepanciesOnly: false }))}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filters.status === '데이터 오류' ? 'border-rose-600 ring-2 ring-rose-600/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">데이터 오류</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.error}</div>
          <div className="text-xs text-rose-600/80 mt-1">결측 및 공백 확인 필요</div>
        </div>

        {/* Spelling Discrepancy Card */}
        <div
          onClick={() => setFilters(prev => ({ ...prev, showDiscrepanciesOnly: !prev.showDiscrepanciesOnly, status: 'ALL' }))}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filters.showDiscrepanciesOnly ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">표기 상이 감지</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.discrepancyCount}</div>
          <div className="text-xs text-amber-600/80 mt-1">스펠링 차이 대조</div>
        </div>

        {/* Duplicate Card */}
        <div
          onClick={() => setFilters(prev => ({ ...prev, showDuplicatesOnly: !prev.showDuplicatesOnly, status: 'ALL' }))}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            filters.showDuplicatesOnly ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">중복 기업</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.duplicateCount}</div>
          <div className="text-xs text-purple-600/80 mt-1">복수 행 등록 감지</div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => { setFilters(prev => ({ ...prev, searchTerm: e.target.value })); setCurrentPage(1); }}
              placeholder="기업명, 담당자, 이메일로 검색..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns & Copy Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => { setFilters(prev => ({ ...prev, status: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
            >
              <option value="ALL">전체 판정 (Status)</option>
              <option value="기존거래">기존거래</option>
              <option value="미거래(타겟)">미거래(타겟)</option>
              <option value="데이터 오류">데이터 오류</option>
            </select>

            {/* Country Filter */}
            <select
              value={filters.country}
              onChange={(e) => { setFilters(prev => ({ ...prev, country: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
            >
              <option value="ALL">모든 국가 (Country)</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Application Filter */}
            <select
              value={filters.application}
              onChange={(e) => { setFilters(prev => ({ ...prev, application: e.target.value })); setCurrentPage(1); }}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
            >
              <option value="ALL">모든 용도 (Application)</option>
              {applications.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {/* Copy button */}
            <button
              onClick={handleCopyFilteredTargets}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all space-x-1.5 shrink-0"
              title="현재 필터링된 미거래 타겟 리스트를 클립보드에 탭 구분 텍스트로 복사"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '복사 완료!' : '미거래 타겟 리스트 복사'}</span>
            </button>
          </div>
        </div>

        {/* Active filters & toggles info */}
        {(filters.showDuplicatesOnly || filters.showDiscrepanciesOnly || filters.status !== 'ALL' || filters.country !== 'ALL' || filters.application !== 'ALL' || filters.searchTerm) && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span>적용된 필터:</span>
              {filters.status !== 'ALL' && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">판정: {filters.status}</span>}
              {filters.country !== 'ALL' && <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">국가: {filters.country}</span>}
              {filters.application !== 'ALL' && <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">용도: {filters.application}</span>}
              {filters.showDuplicatesOnly && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md">중복 기업만</span>}
              {filters.showDiscrepanciesOnly && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">표기 상이만</span>}
              {filters.searchTerm && <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">검색: "{filters.searchTerm}"</span>}
            </div>
            <button
              onClick={() => {
                setFilters({ country: 'ALL', application: 'ALL', status: 'ALL', searchTerm: '', showDuplicatesOnly: false, showDiscrepanciesOnly: false });
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* Main Analyzed Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">거래선 대조 및 잠재 타겟 목록</h3>
            <p className="text-xs text-slate-500">총 {filteredData.length}개 항목 (페이지 {currentPage} / {totalPages})</p>
          </div>
          <div className="text-xs text-slate-400">
            * 행을 클릭하면 상세 정보 및 영업 메일 템플릿을 확인할 수 있습니다.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">판정 결과</th>
                <th className="py-3 px-4 font-semibold">기업명 (company_name)</th>
                <th className="py-3 px-4 font-semibold">국가</th>
                <th className="py-3 px-4 font-semibold">PMMA 용도</th>
                <th className="py-3 px-4 font-semibold">특이사항 / 검토 노트</th>
                <th className="py-3 px-4 font-semibold">담당 연락처</th>
                <th className="py-3 px-4 font-semibold text-right">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {paginatedData.map((item) => (
                <tr
                  key={item.account_id}
                  onClick={() => onSelectAccount(item)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {item.status === '기존거래' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        기존거래
                      </span>
                    )}
                    {item.status === '미거래(타겟)' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Target className="w-3 h-3 mr-1" />
                        미거래(타겟)
                      </span>
                    )}
                    {item.status === '데이터 오류' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        데이터 오류
                      </span>
                    )}
                  </td>

                  {/* Company Name & Duplicate Tag */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div className="flex items-center space-x-2">
                      <span className="group-hover:text-blue-600 transition-colors">{item.company_name || '(기업명 없음)'}</span>
                      {item.isDuplicate && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200" title="중복 기업명 행 감지">
                          중복
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Country */}
                  <td className="py-3 px-4 whitespace-nowrap">{item.country}</td>

                  {/* Application */}
                  <td className="py-3 px-4">{item.application}</td>

                  {/* Discrepancy / Error notes */}
                  <td className="py-3 px-4">
                    {item.isSpellingDiscrepancy && (
                      <span className="inline-flex items-center text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]" title={item.discrepancyReason}>
                        <AlertTriangle className="w-3 h-3 mr-1 shrink-0 text-amber-500" />
                        <span className="truncate max-w-[200px]">{item.discrepancyReason || '표기 상이'}</span>
                      </span>
                    )}
                    {item.errorReason && (
                      <span className="text-rose-600 font-medium text-[11px]">{item.errorReason}</span>
                    )}
                    {!item.isSpellingDiscrepancy && !item.errorReason && (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {item.contact_email || item.phone || '-'}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectAccount(item); }}
                      className="p-1.5 text-slate-400 group-hover:text-blue-600 rounded-lg group-hover:bg-blue-50 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    조건에 일치하는 데이터가 없습니다. 필터를 변경하거나 데이터 관리 센터에서 리스트를 반입해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              전체 {filteredData.length}건 중 {(currentPage - 1) * itemsPerPage + 1} ~ {Math.min(currentPage * itemsPerPage, filteredData.length)}건 표시
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-700 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
