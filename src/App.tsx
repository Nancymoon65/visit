import React, { useState, useEffect, useCallback } from 'react';
import {
  Header
} from './components/Header';
import { GuestbookForm } from './components/GuestbookForm';
import { GuestbookFeed } from './components/GuestbookFeed';
import { SetupTab } from './components/SetupTab';
import { GuideTab } from './components/GuideTab';
import { ToastContainer } from './components/Toast';
import {
  GuestbookEntry,
  NewEntryPayload,
  ConnectionStatus,
  ToastMessage
} from './types';
import {
  getStoredApiUrl,
  saveStoredApiUrl,
  fetchEntriesFromGas,
  submitEntryToGas,
  testGasConnection,
  saveLocalEntries
} from './services/gasApi';
import { INITIAL_MOCK_ENTRIES } from './constants/initialData';
import { Heart, MessageSquare, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

export default function App() {
  const [gasUrl, setGasUrl] = useState<string>(() => getStoredApiUrl());
  const [activeTab, setActiveTab] = useState<'feed' | 'settings' | 'guide'>('feed');
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Liked items tracking
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('sheetlog_liked_ids');
      return stored ? new Set(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() => ({
    isConfigured: !!getStoredApiUrl(),
    isConnected: false,
    isTesting: false,
  }));

  // Toast Helper
  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch entries
  const loadEntries = useCallback(async (url: string, showToast = false) => {
    try {
      const data = await fetchEntriesFromGas(url);
      setEntries(data);
      if (showToast) {
        addToast('success', '새로고침 완료', '최신 방명록 목록을 불러왔습니다.');
      }
      if (url.trim()) {
        setConnectionStatus((prev) => ({
          ...prev,
          isConfigured: true,
          isConnected: true,
          lastChecked: new Date().toISOString(),
        }));
      }
    } catch (err: unknown) {
      console.error('Failed to load entries:', err);
      const errMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      if (url.trim()) {
        setConnectionStatus((prev) => ({
          ...prev,
          isConnected: false,
          errorMessage: errMsg,
        }));
        addToast('error', '데이터 불러오기 실패', `${errMsg} (설정 탭에서 URL 및 배포 권한을 점검해보세요)`);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    loadEntries(gasUrl);
  }, [gasUrl, loadEntries]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEntries(gasUrl, true);
  };

  // Submit new guestbook entry
  const handleSubmitEntry = async (payload: NewEntryPayload) => {
    setIsSubmitting(true);
    try {
      const created = await submitEntryToGas(gasUrl, payload);
      // Optimistic update
      setEntries((prev) => [created, ...prev]);

      addToast(
        'success',
        '응원 메시지가 등록되었습니다!',
        gasUrl.trim()
          ? '구글 스프레드시트에 성공적으로 저장되었습니다.'
          : '체험 모드로 등록되었습니다. (실제 시트에 저장하려면 설정에서 URL을 등록하세요)'
      );

      // If connected to GAS, trigger a background sync after 1.5s to ensure consistency
      if (gasUrl.trim()) {
        setTimeout(() => {
          loadEntries(gasUrl);
        }, 1500);
      }
    } catch (err: unknown) {
      console.error('Submission failed:', err);
      const msg = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.';
      addToast('error', '등록 실패', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save GAS URL
  const handleSaveUrl = async (newUrl: string) => {
    saveStoredApiUrl(newUrl);
    setGasUrl(newUrl);
    setConnectionStatus({
      isConfigured: !!newUrl.trim(),
      isConnected: false,
      isTesting: false,
    });

    if (newUrl.trim()) {
      setIsLoading(true);
      await loadEntries(newUrl);
      addToast('info', 'URL 저장됨', '새로운 구글 앱스 스크립트 주소로 방명록을 불러옵니다.');
      setActiveTab('feed');
    } else {
      addToast('info', '체험 모드 전환', '기본 로컬 모드로 전환되었습니다.');
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    if (!gasUrl.trim()) return;

    setConnectionStatus((prev) => ({ ...prev, isTesting: true }));
    try {
      const result = await testGasConnection(gasUrl);
      setConnectionStatus({
        isConfigured: true,
        isConnected: true,
        isTesting: false,
        latencyMs: result.latencyMs,
        lastChecked: new Date().toISOString(),
      });
      addToast(
        'success',
        '구글 시트 연동 성공!',
        `응답 속도: ${result.latencyMs}ms | 저장된 행: ${result.count ?? 0}개`
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '연결 오류';
      setConnectionStatus({
        isConfigured: true,
        isConnected: false,
        isTesting: false,
        errorMessage: errorMsg,
        lastChecked: new Date().toISOString(),
      });
      addToast('error', '연동 테스트 실패', errorMsg);
    }
  };

  // Like reaction handler
  const handleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('sheetlog_liked_ids', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save liked IDs', e);
      }
      return next;
    });
  };

  // Reset to initial mock data
  const handleResetDemoData = () => {
    saveLocalEntries(INITIAL_MOCK_ENTRIES);
    setEntries(INITIAL_MOCK_ENTRIES);
    addToast('info', '초기화 완료', '체험용 샘플 데이터로 복원되었습니다.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        connectionStatus={connectionStatus}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        entryCount={entries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Banner if in Demo mode */}
        {!gasUrl.trim() && activeTab === 'feed' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-950">
                  나만의 구글 스프레드시트를 실시간 DB로 연결해보세요!
                </p>
                <p className="text-xs text-emerald-800">
                  Google Apps Script로 5분 만에 무료 API를 배포할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setActiveTab('guide')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                연동 가이드 보기
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                URL 등록하기
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Feed & Form */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <GuestbookForm
                onSubmit={handleSubmitEntry}
                isSubmitting={isSubmitting}
                isGasConfigured={!!gasUrl.trim()}
              />

              {/* Quick info tip */}
              <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>구글 시트 연동 팁</span>
                </div>
                <p className="leading-relaxed">
                  스프레드시트에 직접 접속하여 내용을 수정하거나 불필요한 행을 삭제한 후, 상단의 <strong>[새로고침]</strong>을 누르면 변경사항이 즉시 반영됩니다.
                </p>
              </div>
            </div>

            {/* Right Column: Feed Grid */}
            <div className="lg:col-span-7">
              <GuestbookFeed
                entries={entries}
                isLoading={isLoading}
                onLike={handleLike}
                likedIds={likedIds}
                isGasConfigured={!!gasUrl.trim()}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <SetupTab
            gasUrl={gasUrl}
            onSaveUrl={handleSaveUrl}
            onTestConnection={handleTestConnection}
            connectionStatus={connectionStatus}
            onResetDemoData={handleResetDemoData}
            onCopyNotify={() => addToast('info', '코드 복사됨', '클립보드에 복사되었습니다.')}
          />
        )}

        {/* Tab 3: Guide */}
        {activeTab === 'guide' && (
          <GuideTab
            onCopyNotify={() => addToast('info', '코드 복사됨', '클립보드에 복사되었습니다.')}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <span>시트로그 (SheetLog) — 구글 스프레드시트 Web App API 기반 방명록</span>
          </p>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('guide')}
              className="text-slate-600 hover:text-emerald-700 transition-colors"
            >
              API 코드 & 가이드
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-slate-600 hover:text-emerald-700 transition-colors"
            >
              연동 설정
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
            >
              <span>Google Sheets 바로가기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
