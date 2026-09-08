import React, { useState, useEffect, useMemo } from 'react';
import { ExistingAccount, PotentialAccount, AnalyzedAccount } from './types';
import { INITIAL_EXISTING_ACCOUNTS, INITIAL_POTENTIAL_ACCOUNTS } from './data/sampleData';
import { analyzeAccounts } from './utils/parser';
import { Navbar } from './components/Navbar';
import { DataManagementView } from './components/DataManagementView';
import { ComparisonDashboardView } from './components/ComparisonDashboardView';
import { AccountDetailModal } from './components/AccountDetailModal';

const STORAGE_KEY_EXISTING = 'exs04.master.v1';
const STORAGE_KEY_POTENTIAL = 'exs04.potential.v1';

export default function App() {
  // Existing accounts state
  const [existingAccounts, setExistingAccounts] = useState<ExistingAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXISTING);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load existing accounts from localStorage', e);
    }
    return INITIAL_EXISTING_ACCOUNTS;
  });

  // Potential accounts state
  const [potentialAccounts, setPotentialAccounts] = useState<PotentialAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POTENTIAL);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load potential accounts from localStorage', e);
    }
    return INITIAL_POTENTIAL_ACCOUNTS;
  });

  // Active tab: data-management (S-01) or dashboard (S-02)
  const [activeTab, setActiveTab] = useState<'data-management' | 'dashboard'>('dashboard');

  // Selected account for detail modal (S-03)
  const [selectedAccount, setSelectedAccount] = useState<AnalyzedAccount | null>(null);

  // Persist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXISTING, JSON.stringify(existingAccounts));
    } catch (e) {
      console.error('Failed to save existing accounts', e);
    }
  }, [existingAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POTENTIAL, JSON.stringify(potentialAccounts));
    } catch (e) {
      console.error('Failed to save potential accounts', e);
    }
  }, [potentialAccounts]);

  // Analyzed data computed in real-time
  const analyzedData = useMemo(() => {
    return analyzeAccounts(potentialAccounts, existingAccounts);
  }, [potentialAccounts, existingAccounts]);

  // Statistics
  const { totalCount, existingCount, targetCount, errorCount } = useMemo(() => {
    let existing = 0;
    let target = 0;
    let error = 0;
    analyzedData.forEach(item => {
      if (item.status === '기존거래') existing++;
      else if (item.status === '미거래(타겟)') target++;
      else if (item.status === '데이터 오류') error++;
    });
    return {
      totalCount: analyzedData.length,
      existingCount: existing,
      targetCount: target,
      errorCount: error,
    };
  }, [analyzedData]);

  // Reset to sample data handler
  const handleResetToSample = () => {
    if (window.confirm('기본 샘플 데이터(D-S04)로 초기화하시겠습니까? 현재 입력된 데이터는 덮어씌워집니다.')) {
      setExistingAccounts(INITIAL_EXISTING_ACCOUNTS);
      setPotentialAccounts(INITIAL_POTENTIAL_ACCOUNTS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        totalCount={totalCount}
        existingCount={existingCount}
        targetCount={targetCount}
        errorCount={errorCount}
        onResetToSample={handleResetToSample}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {activeTab === 'data-management' ? (
          <DataManagementView
            existingAccounts={existingAccounts}
            setExistingAccounts={setExistingAccounts}
            potentialAccounts={potentialAccounts}
            setPotentialAccounts={setPotentialAccounts}
            onLoadSampleData={handleResetToSample}
            onGoToDashboard={() => setActiveTab('dashboard')}
          />
        ) : (
          <ComparisonDashboardView
            analyzedData={analyzedData}
            onSelectAccount={(acc) => setSelectedAccount(acc)}
            onGoToDataManagement={() => setActiveTab('data-management')}
          />
        )}
      </main>

      {/* Detail Modal (S-03) */}
      <AccountDetailModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
}
