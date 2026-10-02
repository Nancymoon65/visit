import React, { useState } from 'react';
import {
  Link,
  CheckCircle2,
  AlertCircle,
  Play,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileSpreadsheet,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ConnectionStatus } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../constants/gasScript';

interface SetupTabProps {
  gasUrl: string;
  onSaveUrl: (url: string) => void;
  onTestConnection: () => Promise<void>;
  connectionStatus: ConnectionStatus;
  onResetDemoData: () => void;
  onCopyNotify: () => void;
}

export const SetupTab: React.FC<SetupTabProps> = ({
  gasUrl,
  onSaveUrl,
  onTestConnection,
  connectionStatus,
  onResetDemoData,
  onCopyNotify,
}) => {
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(urlInput.trim());
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setHasCopiedCode(true);
    onCopyNotify();
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. URL Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">구글 앱스 스크립트(Web App) 연동 설정</h2>
            <p className="text-xs text-slate-500">
              배포한 구글 앱스 스크립트 웹앱 URL을 입력하면 실시간으로 구글 스프레드시트와 데이터를 동기화합니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor="gas-url" className="block text-xs font-semibold text-slate-700 mb-1.5">
              웹 앱 URL (Web App URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="gas-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer shrink-0"
              >
                URL 저장
              </button>
              <button
                type="button"
                onClick={onTestConnection}
                disabled={connectionStatus.isTesting || !urlInput.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {connectionStatus.isTesting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>연결 테스트 중...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>연동 테스트</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Status result panel */}
        {connectionStatus.isConfigured && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">연결 상태:</span>
              {connectionStatus.isConnected ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  연동 성공 {connectionStatus.latencyMs !== undefined && `(${connectionStatus.latencyMs}ms)`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  {connectionStatus.errorMessage || '연결 실패 (URL 및 배포 권한을 확인해주세요)'}
                </span>
              )}
            </div>

            {connectionStatus.lastChecked && (
              <span className="text-slate-400">
                마지막 확인: {new Date(connectionStatus.lastChecked).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {/* Demo Mode Notice */}
        {!connectionStatus.isConfigured && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">현재 '로컬 체험 모드'로 동작 중입니다.</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                URL을 등록하지 않아도 브라우저 로컬 저장소를 통해 등록 및 조회를 바로 체험하실 수 있습니다.
                실제 구글 시트에 데이터를 영구 보관하려면 아래 6단계 가이드를 따라 스크립트를 배포하세요!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Visual Step-by-Step Tutorial Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">구글 시트 5분 연동 가이드</h3>
              <p className="text-xs text-slate-500">누구나 따라 할 수 있는 초간단 단계별 설정법</p>
            </div>
          </div>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <span>새 스프레드시트 열기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-800">새 구글 스프레드시트 생성</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Drive에서 새 스프레드시트를 만듭니다. (시트 이름은 자유롭게 설정 가능하며, 첫 행 헤더는 스크립트가 자동 생성해 줍니다.)
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-800">Apps Script 편집기 열기</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              시트 상단 메뉴에서 <span className="font-semibold text-slate-900">[확장 프로그램]</span> → <span className="font-semibold text-slate-900">[Apps Script]</span>를 클릭합니다.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-800">코드 붙여넣기 및 저장</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              열린 편집기의 기존 코드를 지우고, 아래의 <span className="font-semibold text-emerald-700">Apps Script 소스코드</span>를 복사하여 붙여넣은 뒤 저장(<kbd className="px-1 py-0.5 bg-white border rounded text-[10px]">Ctrl+S</kbd>)합니다.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h4 className="text-xs font-bold text-slate-800">웹 앱으로 새 배포 생성</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              우측 상단의 파란색 <span className="font-semibold text-slate-900">[배포]</span> 버튼 클릭 → <span className="font-semibold text-slate-900">[새 배포]</span>를 선택합니다.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                5
              </span>
              <h4 className="text-xs font-bold text-amber-900">배포 권한 설정 (핵심 ⭐)</h4>
            </div>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              <li>유형: 톱니바퀴 클릭 후 <strong>'웹 앱'</strong> 선택</li>
              <li>다음 사용자로 실행: <strong>'나'</strong></li>
              <li>액세스 권한: <strong>'모든 사용자 (Anyone)'</strong> 선택!</li>
            </ul>
          </div>

          {/* Step 6 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                6
              </span>
              <h4 className="text-xs font-bold text-emerald-900">URL 복사 및 연동 완료!</h4>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              [배포]를 완료하고 화면에 나타난 <strong>'웹 앱 URL(.../exec)'</strong>을 복사하여 상단 설정창에 붙여넣고 [연동 테스트]를 누르면 끝입니다!
            </p>
          </div>
        </div>
      </div>

      {/* 3. Apps Script Code Viewer with One-Click Copy */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Code.gs (Google Apps Script API)</span>
          </div>

          <button
            onClick={handleCopyCode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              hasCopiedCode
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {hasCopiedCode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>코드 전체 복사</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-900/90">
          <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
        </div>
      </div>

      {/* 4. Troubleshooting & FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <button
          onClick={() => setShowFaq(!showFaq)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              자주 묻는 질문 & 문제 해결 (FAQ)
            </h3>
          </div>
          {showFaq ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showFaq && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900 mb-1">
                Q. 처음 배포할 때 '안전하지 않은 앱' 또는 'Google에서 확인하지 않은 앱' 경고가 나타나요.
              </p>
              <p className="leading-relaxed">
                A. 직접 작성한 개인 스크립트이므로 구글 보안 시스템이 표시하는 정상적인 안내입니다. 팝업 하단의 <span className="font-semibold text-slate-800">[고급]</span> → <span className="font-semibold text-slate-800">[(프로젝트 이름)(으)로 이동(안전하지 않음)]</span>을 클릭하고 <span className="font-semibold text-slate-800">[허용]</span>을 누르시면 정상 배포됩니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-1">
                Q. Apps Script 코드를 수정한 뒤 저장을 눌렀는데 웹앱에 반영이 안 돼요!
              </p>
              <p className="leading-relaxed">
                A. 구글 앱스 스크립트는 코드를 수정할 때마다 반드시 <span className="font-semibold text-slate-800">[배포] → [배포 관리] → 연필 모양(수정) → 버전: '새 버전' 선택 → [배포]</span>를 눌러야 최신 코드가 웹 앱에 반영됩니다.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-900 mb-1">
                Q. CORS 또는 네트워크 오류가 발생합니다.
              </p>
              <p className="leading-relaxed">
                A. 5단계의 액세스 권한이 <span className="font-semibold text-slate-800">'모든 사용자(Anyone)'</span>로 설정되어 있는지 확인하세요. 만약 '나만' 혹은 '특정 조직'으로 되어 있으면 익명 브라우저 요청이 차단됩니다.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onResetDemoData}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium py-1 px-2.5 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>체험용 초기 데모 데이터로 되돌리기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
