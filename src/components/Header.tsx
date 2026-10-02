import React from 'react';
import { Table, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Settings, MessageSquareText } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  activeTab: 'feed' | 'settings' | 'guide';
  onTabChange: (tab: 'feed' | 'settings' | 'guide') => void;
  connectionStatus: ConnectionStatus;
  onRefresh: () => void;
  isRefreshing: boolean;
  entryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  connectionStatus,
  onRefresh,
  isRefreshing,
  entryCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-3">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
              <Table className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  시트로그 <span className="text-emerald-600 font-semibold text-sm">SheetLog</span>
                </h1>
                
                {/* Connection Status indicator */}
                {connectionStatus.isConfigured ? (
                  <span
                    title={connectionStatus.isConnected ? '구글 스프레드시트와 정상 연동됨' : '구글 시트 연결 확인 중'}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      connectionStatus.isConnected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {connectionStatus.isConnected ? '시트 실시간 연동' : '연결 점검 필요'}
                  </span>
                ) : (
                  <button
                    onClick={() => onTabChange('settings')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    체험 모드 (로컬)
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                구글 스프레드시트를 실시간 DB로 사용하는 오픈 방명록
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === 'feed' && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors shadow-2xs"
                title="최신 방명록 새로고침"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>새로고침</span>
              </button>
            )}

            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
              <button
                onClick={() => onTabChange('feed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'feed'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
                <span>방명록</span>
                <span className="text-[11px] px-1.5 py-0.2 bg-slate-200/80 rounded-full text-slate-700 ml-0.5">
                  {entryCount}
                </span>
              </button>

              <button
                onClick={() => onTabChange('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>시트 연동 설정</span>
              </button>

              <button
                onClick={() => onTabChange('guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'guide'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>코드 & 가이드</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
