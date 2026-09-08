import React, { useState } from 'react';
import { AnalyzedAccount } from '../types';
import { X, Copy, Check, ShieldCheck, Target, AlertCircle, AlertTriangle, Building, Mail, Phone, User, Globe } from 'lucide-react';

interface AccountDetailModalProps {
  account: AnalyzedAccount | null;
  onClose: () => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({ account, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!account) return null;

  const emailSnippet = `[LXMMA 영업팀] PMMA 제품 협력 및 샘플 공급 안내 - ${account.company_name} 귀중

안녕하세요,
글로벌 프리미엄 PMMA 선도 공급사 (주)LXMMA 영업팀입니다.

${account.country} 지역의 ${account.application} 분야에서 당사 PMMA 제품군 적용을 검토하실 수 있도록 안내 드립니다.
귀사의 고품질 제품 생산에 당사 PMMA 소재가 최적의 솔루션이 될 것으로 확신하며, 관련 기술 자료 및 테스트 샘플을 무상 제공해 드리고자 합니다.

담당자님과의 일정을 조율하여 상세한 제안을 드리고 싶습니다. 회신 부탁드립니다.

감사합니다.
(주)LXMMA 영업팀 드림`;

  const handleCopyEmail = () => {
    if (!account.contact_email) return;
    navigator.clipboard.writeText(account.contact_email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(emailSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
              {account.company_name ? account.company_name[0] : '?'}
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">{account.company_name}</h3>
              <p className="text-xs text-slate-400">ID: {account.account_id} | 국가: {account.country}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Badge & Warnings */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px] mb-1">판정 결과</span>
              {account.status === '기존거래' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  기존거래 ({account.matchedExistingName || '마스터 일치'})
                </span>
              )}
              {account.status === '미거래(타겟)' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Target className="w-3.5 h-3.5 mr-1" />
                  미거래 타겟 (신규 영업 공략)
                </span>
              )}
              {account.status === '데이터 오류' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  데이터 오류 ({account.errorReason})
                </span>
              )}
            </div>

            {account.isDuplicate && (
              <div className="border-l border-slate-300 pl-4">
                <span className="text-slate-500 block text-[11px] mb-1">중복 여부</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-medium text-xs border border-purple-200">
                  동일 기업명 복수 행 등록됨
                </span>
              </div>
            )}

            {account.isSpellingDiscrepancy && (
              <div className="border-l border-slate-300 pl-4">
                <span className="text-slate-500 block text-[11px] mb-1">표기 상이 경고</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-medium text-xs border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  {account.discrepancyReason}
                </span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium">PMMA 사용 용도</span>
              <div className="text-slate-900 font-semibold text-sm">{account.application}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium">담당자</span>
              <div className="text-slate-900 font-semibold text-sm flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>{account.contact_person || '미지정'}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium">이메일 연락처</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-mono">{account.contact_email || '등록 없음'}</span>
                {account.contact_email && (
                  <button
                    onClick={handleCopyEmail}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors flex items-center space-x-1"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? '복사됨' : '복사'}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-medium">전화번호</span>
              <div className="text-slate-900 font-mono flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{account.phone || '등록 없음'}</span>
              </div>
            </div>
          </div>

          {/* Email Draft Template for Targets */}
          {account.status === '미거래(타겟)' && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>영업 공략 메일 초안 템플릿</span>
                </h4>
                <button
                  onClick={handleCopySnippet}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-all flex items-center space-x-1 shadow-xs"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? '메일 초안 복사 완료!' : '메일 초안 복사'}</span>
                </button>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 whitespace-pre-wrap text-[11px] leading-relaxed">
                {emailSnippet}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-all shadow-xs"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
