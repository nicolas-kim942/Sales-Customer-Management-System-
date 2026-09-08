import React, { useState } from 'react';
import { ExistingAccount, PotentialAccount } from '../types';
import { parseUploadedFile, parseTextPaste } from '../utils/parser';
import { Upload, Plus, Trash2, FileText, CheckCircle2, AlertCircle, Database, Edit3, ArrowRight, Table, RefreshCw } from 'lucide-react';

interface DataManagementViewProps {
  existingAccounts: ExistingAccount[];
  setExistingAccounts: React.Dispatch<React.SetStateAction<ExistingAccount[]>>;
  potentialAccounts: PotentialAccount[];
  setPotentialAccounts: React.Dispatch<React.SetStateAction<PotentialAccount[]>>;
  onLoadSampleData: () => void;
  onGoToDashboard: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  existingAccounts,
  setExistingAccounts,
  potentialAccounts,
  setPotentialAccounts,
  onLoadSampleData,
  onGoToDashboard,
}) => {
  // Master add form state
  const [newExName, setNewExName] = useState('');
  const [newExCountry, setNewExCountry] = useState('대한민국');
  const [newExNotes, setNewExNotes] = useState('');

  // Paste text state for potential
  const [pasteText, setPasteText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'potential' | 'existing'>('potential');

  // Notification state
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  // Add single existing account
  const handleAddExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) {
      showNotice('error', '기존 거래처명을 입력해주세요.');
      return;
    }
    const newEx: ExistingAccount = {
      ex_id: `EX-${String(existingAccounts.length + 1).padStart(3, '0')}`,
      company_name: newExName.trim(),
      country: newExCountry.trim(),
      notes: newExNotes.trim(),
    };
    setExistingAccounts([newEx, ...existingAccounts]);
    setNewExName('');
    setNewExNotes('');
    showNotice('success', `기존 거래처 "${newEx.company_name}"가 등록되었습니다.`);
  };

  // Delete existing account
  const handleDeleteExisting = (ex_id: string) => {
    setExistingAccounts(existingAccounts.filter(item => item.ex_id !== ex_id));
    showNotice('success', '기존 거래처가 삭제되었습니다.');
  };

  // Handle potential file upload
  const handlePotentialFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseUploadedFile(file);
      if (data && data.length > 0) {
        // Map and format
        const formatted: PotentialAccount[] = data.map((row: any, idx: number) => ({
          account_id: row.account_id || row['업체ID'] || `ACC-${String(idx + 1).padStart(3, '0')}`,
          company_name: row.company_name || row['기업명'] || row['업체명'] || row['Company'] || '',
          country: row.country || row['국가'] || row['국가명'] || '기타',
          application: row.application || row['용도'] || row['사용용도'] || '일반',
          contact_email: row.contact_email || row['이메일'] || row['연락처(Email)'] || '',
          contact_person: row.contact_person || row['담당자'] || '',
          phone: row.phone || row['전화번호'] || '',
        }));

        setPotentialAccounts(formatted);
        showNotice('success', `총 ${formatted.length}건의 잠재 고객 데이터가 성공적으로 반입되었습니다.`);
      } else {
        showNotice('error', '파일에 유효한 데이터가 없습니다.');
      }
    } catch (err: any) {
      showNotice('error', `파일 파싱 실패: ${err.message || '알 수 없는 오류'}`);
    }
    e.target.value = '';
  };

  // Handle existing master file upload
  const handleExistingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseUploadedFile(file);
      if (data && data.length > 0) {
        const formatted: ExistingAccount[] = data.map((row: any, idx: number) => ({
          ex_id: row.ex_id || row['거래처ID'] || `EX-${String(idx + 1).padStart(3, '0')}`,
          company_name: row.company_name || row['기업명'] || row['거래처명'] || row['Company'] || '',
          country: row.country || row['국가'] || '대한민국',
          notes: row.notes || row['비고'] || '',
        })).filter(x => x.company_name);

        setExistingAccounts(formatted);
        showNotice('success', `총 ${formatted.length}건의 기존 거래처 마스터가 갱신되었습니다.`);
      } else {
        showNotice('error', '파일에 유효한 데이터가 없습니다.');
      }
    } catch (err: any) {
      showNotice('error', `파일 파싱 실패: ${err.message || '알 수 없는 오류'}`);
    }
    e.target.value = '';
  };

  // Handle text paste for potential
  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = parseTextPaste(pasteText);
      if (data && data.length > 0) {
        const formatted: PotentialAccount[] = data.map((row: any, idx: number) => ({
          account_id: row.account_id || `ACC-P-${String(idx + 1).padStart(3, '0')}`,
          company_name: row.company_name || row['기업명'] || row['업체명'] || Object.values(row)[0] || '',
          country: row.country || row['국가'] || '해외기타',
          application: row.application || row['용도'] || '일반',
          contact_email: row.contact_email || row['이메일'] || '',
        }));
        setPotentialAccounts(formatted);
        setPasteText('');
        showNotice('success', `붙여넣기한 텍스트에서 ${formatted.length}건을 반입했습니다.`);
      } else {
        showNotice('error', '파싱 가능한 텍스트 데이터가 없습니다. CSV 또는 탭 구분 형식으로 입력해주세요.');
      }
    } catch (err: any) {
      showNotice('error', `텍스트 파싱 오류: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Notice banner */}
      {notice && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium shadow-sm transition-all ${
          notice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Top Banner & Quick actions */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-blue-800/60 border border-blue-700/50 px-3 py-1 rounded-full text-xs font-medium text-blue-200">
            <Database className="w-3.5 h-3.5" />
            <span>S-01 데이터 관리 센터</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">잠재 고객 반입 및 기존 거래처 마스터 관리</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            국가별 PMMA 사용 업체 조사 파일(CSV/XLSX)을 반입하거나 텍스트로 붙여넣고, 사내 기존 거래처 명단과 대조하여 미거래 타겟을 발굴합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onLoadSampleData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl border border-white/20 transition-all flex items-center space-x-2 backdrop-blur-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>기본 샘플 데이터 로드 (D-S04)</span>
          </button>
          <button
            onClick={onGoToDashboard}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
          >
            <span>대시보드로 이동</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('potential')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'potential'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>잠재 고객 리스트 반입 ({potentialAccounts.length}건)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('existing')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeSubTab === 'existing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>기존 거래처 마스터 관리 ({existingAccounts.length}건)</span>
        </button>
      </div>

      {/* Content for Potential Tab */}
      {activeSubTab === 'potential' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Upload & Paste tools */}
          <div className="space-y-6 lg:col-span-1">
            {/* File upload box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>잠재 고객 파일 업로드</span>
              </h3>
              <p className="text-xs text-slate-500">
                CSV 또는 XLSX 파일을 업로드하면 즉시 파싱되어 마스터와 대조됩니다. (필수 컬럼: company_name, country, application)
              </p>
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-all group">
                <FileText className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  파일 선택 또는 드래그 앤 드롭
                </span>
                <span className="text-xs text-slate-400 mt-1">.csv, .xlsx, .xls 지원</span>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handlePotentialFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Text paste box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Table className="w-5 h-5 text-blue-600" />
                <span>텍스트 직접 붙여넣기</span>
              </h3>
              <p className="text-xs text-slate-500">
                엑셀이나 표 형식의 데이터를 복사하여 붙여넣으세요 (첫 행은 헤더로 자동 인식).
              </p>
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <textarea
                  rows={5}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="company_name,country,application&#10;Global Optronics,미국,태양광 패널&#10;Nihon Acrylic,일본,아크릴 가구"
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                >
                  붙여넣기 데이터 반입
                </button>
              </form>
            </div>
          </div>

          {/* Right: Preview Table of Potential Accounts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">반입된 잠재 고객 미리보기</h3>
                <p className="text-xs text-slate-500">총 {potentialAccounts.length}개 잠재 기업 레코드</p>
              </div>
              <button
                onClick={() => setPotentialAccounts([])}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>전체 비우기</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">기업명 (company_name)</th>
                    <th className="py-3 px-4 font-semibold">국가</th>
                    <th className="py-3 px-4 font-semibold">용도</th>
                    <th className="py-3 px-4 font-semibold">연락처(Email)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {potentialAccounts.slice(0, 100).map((acc, index) => (
                    <tr key={acc.account_id || index} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{acc.account_id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{acc.company_name}</td>
                      <td className="py-2.5 px-4">{acc.country}</td>
                      <td className="py-2.5 px-4">{acc.application}</td>
                      <td className="py-2.5 px-4 text-slate-500">{acc.contact_email || '-'}</td>
                    </tr>
                  ))}
                  {potentialAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        반입된 잠재 고객 데이터가 없습니다. 파일을 업로드하거나 기본 샘플 데이터를 로드하세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {potentialAccounts.length > 100 && (
              <p className="text-xs text-slate-400 text-center">
                * 성능과 가독성을 위해 상위 100개 행만 표시됩니다 (총 {potentialAccounts.length}건).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content for Existing Master Tab */}
      {activeSubTab === 'existing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Add & Upload Master */}
          <div className="space-y-6 lg:col-span-1">
            {/* Upload master file */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>기존 거래처 마스터 파일 일괄 업로드</span>
              </h3>
              <p className="text-xs text-slate-500">
                기존 거래처 명단 파일(CSV/XLSX)을 업로드하여 마스터를 교체합니다.
              </p>
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-all group">
                <Database className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                  마스터 파일 선택
                </span>
                <span className="text-xs text-slate-400 mt-1">.csv, .xlsx 지원</span>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleExistingFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Add single existing account form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>기존 거래처 단건 직접 등록</span>
              </h3>
              <form onSubmit={handleAddExisting} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">기업명 (company_name) *</label>
                  <input
                    type="text"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="예: (주)신규거래처"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">국가</label>
                  <input
                    type="text"
                    value={newExCountry}
                    onChange={(e) => setNewExCountry(e.target.value)}
                    placeholder="대한민국"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">비고 / 용도</label>
                  <input
                    type="text"
                    value={newExNotes}
                    onChange={(e) => setNewExNotes(e.target.value)}
                    placeholder="주력 파트너"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                >
                  기존 거래처 추가
                </button>
              </form>
            </div>
          </div>

          {/* Right: Existing Master Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">기존 거래처 마스터 명단 (D-S04-2)</h3>
              <p className="text-xs text-slate-500">현재 등록된 사내 기존 거래처 ({existingAccounts.length}개)</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">기존 거래처명</th>
                    <th className="py-3 px-4 font-semibold">국가</th>
                    <th className="py-3 px-4 font-semibold">비고</th>
                    <th className="py-3 px-4 font-semibold text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {existingAccounts.map((ex) => (
                    <tr key={ex.ex_id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{ex.ex_id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{ex.company_name}</td>
                      <td className="py-2.5 px-4">{ex.country || '-'}</td>
                      <td className="py-2.5 px-4 text-slate-500">{ex.notes || '-'}</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteExisting(ex.ex_id)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {existingAccounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        등록된 기존 거래처가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
