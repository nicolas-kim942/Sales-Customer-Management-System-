import React from 'react';
import { Building2, FileSpreadsheet, RefreshCw, Sparkles, ShieldCheck, LogOut, User } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  existingCount: number;
  targetCount: number;
  errorCount: number;
  onResetToSample: () => void;
  activeTab: 'data-management' | 'dashboard';
  setActiveTab: (tab: 'data-management' | 'dashboard') => void;
  userEmail?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  existingCount,
  targetCount,
  errorCount,
  onResetToSample,
  activeTab,
  setActiveTab,
  userEmail,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  PMMA 영업 타겟팅 및 거래선 비교 시스템
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  LXMMA 영업지원
                </span>
              </div>
              <p className="text-xs text-slate-500">
                기준일: 2026-08-27 | 글로벌 PMMA 사용 업체 자동 판정 및 타겟 발굴
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('data-management')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'data-management'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. 데이터 관리 센터 (S-01)
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. 타겟 비교 대시보드 (S-02)
            </button>
          </div>

          {/* Quick stats & Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span>전체: <strong className="text-slate-900">{totalCount}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600">기존거래: <strong>{existingCount}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-600">타겟: <strong>{targetCount}</strong></span>
              {errorCount > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-rose-600">오류: <strong>{errorCount}</strong></span>
                </>
              )}
            </div>

            <button
              onClick={onResetToSample}
              title="초기 샘플 데이터로 복원"
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              샘플 복원
            </button>

            {userEmail && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <span className="text-xs text-slate-600 hidden xl:inline flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {userEmail}
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="로그아웃"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="flex md:hidden py-2 border-t border-slate-100 space-x-2">
          <button
            onClick={() => setActiveTab('data-management')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
              activeTab === 'data-management' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            1. 데이터 관리 (S-01)
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            2. 대시보드 (S-02)
          </button>
        </div>
      </div>
    </header>
  );
};

