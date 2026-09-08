import React, { useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, getSupabaseConfig } from '../lib/supabase';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowRight, Database, Code, Check, Settings, Server } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: any) => void;
  onBypassForDemo: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onBypassForDemo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Supabase runtime config state
  const currentConfig = getSupabaseConfig();
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);
  const [configSuccess, setConfigSuccess] = useState(false);

  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const supabaseSqlScript = `-- 1. 기존 거래처 마스터 테이블
create table if not exists public.existing_accounts (
  ex_id text primary key,
  company_name text not null,
  country text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 잠재 고객 리스트 테이블 (누적 저장용)
create table if not exists public.potential_accounts (
  account_id text primary key,
  company_name text not null,
  country text,
  application text,
  contact_email text,
  contact_person text,
  phone text,
  batch_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 업로드 이력 (배치 누적 로그) 테이블
create table if not exists public.upload_logs (
  id uuid default gen_random_uuid() primary key,
  file_name text,
  record_count int,
  uploaded_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 보안 정책 설정 (인증된 사용자만 접근)
alter table public.existing_accounts enable row level security;
alter table public.potential_accounts enable row level security;
alter table public.upload_logs enable row level security;

create policy "Allow auth users existing_accounts" on public.existing_accounts for all using (auth.role() = 'authenticated');
create policy "Allow auth users potential_accounts" on public.potential_accounts for all using (auth.role() = 'authenticated');
create policy "Allow auth users upload_logs" on public.upload_logs for all using (auth.role() = 'authenticated');`;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('supabase_custom_url', supabaseUrl.trim());
    localStorage.setItem('supabase_custom_key', supabaseKey.trim());
    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
      setShowConfig(false);
    }, 1500);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      setErrorMsg('Supabase URL 및 Anon Key가 올바르게 설정되지 않았습니다. 아래 Supabase 설정 버튼을 눌러 키를 입력해주세요.');
      setShowConfig(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          alert('회원가입이 완료되었습니다. 로그인되었습니다.');
          onLoginSuccess(data.user);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-8 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">LXMMA 영업 보안 인증</h2>
          <p className="text-xs text-slate-300 mt-1">
            인가된 영업 임직원 전용 시스템 (Supabase Auth & Database)
          </p>
        </div>

        {/* Body Form */}
        <div className="p-8 space-y-6">
          {/* Supabase Config Toggle / Panel */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Supabase 연결 설정</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSupabaseConfigured() ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isSupabaseConfigured() ? '연결됨' : '설정 필요'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center space-x-1"
              >
                <Settings className="w-3.5 h-3.5 mr-0.5" />
                <span>{showConfig ? '설정 닫기' : '설정 수정'}</span>
              </button>
            </div>

            {showConfig && (
              <form onSubmit={handleSaveConfig} className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supabase Project URL</label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Supabase Anon Public Key</label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  {configSuccess && (
                    <span className="text-emerald-600 text-xs font-medium flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> 설정 저장 완료!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all ml-auto"
                  >
                    설정 저장
                  </button>
                </div>
              </form>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">이메일 계정 (Email)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@lxmma.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">비밀번호 (Password)</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? '처리 중...' : isSignUp ? '회원가입 및 로그인' : '로그인'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline font-medium"
            >
              {isSignUp ? '기존 계정으로 로그인하기' : '새 인가 계정 등록 (Sign Up)'}
            </button>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              <Code className="w-3.5 h-3.5" />
              <span>DB SQL 보기</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBypassForDemo}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all text-center"
            >
              데모 모드로 바로 시작하기 (Local 호환)
            </button>
          </div>
        </div>
      </div>

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-65 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Supabase DB 구축용 SQL 스크립트</span>
              </h3>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold"
              >
                닫기
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Supabase 대시보드 내 <strong>SQL Editor</strong>에 아래 쿼리를 입력하여 테이블을 생성하세요.
            </p>
            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72">
                {supabaseSqlScript}
              </pre>
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL 복사 완료!' : 'SQL 복사'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
