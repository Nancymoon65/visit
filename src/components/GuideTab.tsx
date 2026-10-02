import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Table
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../constants/gasScript';

interface GuideTabProps {
  onCopyNotify: () => void;
  onNavigateToSettings: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({
  onCopyNotify,
  onNavigateToSettings,
}) => {
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setHasCopiedCode(true);
    onCopyNotify();
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro Hero */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            초보자를 위한 구글 시트 API 연동 가이드
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            구글 스프레드시트를 나만의 무료 데이터베이스로!
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed mb-4">
            복잡한 백엔드 서버나 유료 데이터베이스 구축 없이, 구글 앱스 스크립트(Google Apps Script)의
            Web App 기능을 활용하여 JSON API를 5분 만에 만들 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
            >
              {hasCopiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>Apps Script 코드 복사</span>
            </button>
            <button
              onClick={onNavigateToSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition-colors cursor-pointer"
            >
              <span>웹 앱 URL 등록하러 가기 →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Structure Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">1. 스프레드시트 컬럼 구조</h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            ✨ 미리 만들 필요 없음 (100% 자동 생성)
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl mb-3 text-xs text-emerald-900 leading-relaxed">
          <strong>💡 완전히 빈 시트 상태로 두셔도 됩니다!</strong><br />
          코드가 첫 실행될 때 시트가 비어있음을 감지하여 <strong>헤더 5개 열, 에메랄드 배경 서식, 열 너비, 1행 틀고정까지 자동으로 세팅</strong>합니다.
        </div>

        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          만약 직접 손으로 미리 입력해두고 싶으시다면, 1행에 아래와 같이 5개 열 이름을 적어두시면 됩니다:
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-700 text-white font-semibold">
                <th className="p-2.5 border-r border-emerald-600/50">A열: 등록일시</th>
                <th className="p-2.5 border-r border-emerald-600/50">B열: 이름</th>
                <th className="p-2.5 border-r border-emerald-600/50">C열: 응원메시지</th>
                <th className="p-2.5 border-r border-emerald-600/50">D열: 태그</th>
                <th className="p-2.5">E열: 고유ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-slate-50/50 text-slate-700 font-mono">
              <tr>
                <td className="p-2.5 border-r border-slate-200">2026-09-30 22:50:00</td>
                <td className="p-2.5 border-r border-slate-200">개발자 민우</td>
                <td className="p-2.5 border-r border-slate-200">프로젝트 오픈 축하드립니다! 🎉</td>
                <td className="p-2.5 border-r border-slate-200">응원·격려</td>
                <td className="p-2.5">entry_17277654...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Step by Step visual flow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600" />
          <span>2. 단계별 배포 순서 (정확한 메뉴 안내)</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-bold text-slate-900">구글 스프레드시트 열기</p>
              <p className="text-slate-600 mt-0.5">
                Google Sheets (<a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">sheets.new</a>)에서 새 시트를 하나 생성합니다.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-bold text-slate-900">Apps Script 편집기 실행</p>
              <p className="text-slate-600 mt-0.5">
                상단 메뉴 바에서 <strong>[확장 프로그램]</strong> → <strong>[Apps Script]</strong>를 클릭하면 브라우저에 스크립트 편집기 탭이 열립니다.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-bold text-slate-900">소스코드 붙여넣기 및 저장</p>
              <p className="text-slate-600 mt-0.5">
                편집기 창에 있는 기존 <code>function myFunction() &#123;&#125;</code> 코드를 모두 지우고, 아래의 <strong>Code.gs</strong> 전체를 붙여넣은 뒤 <strong>Ctrl + S (저장)</strong>를 누릅니다.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
            <div>
              <p className="font-bold text-amber-950">새 웹 앱 배포 설정 (가장 중요! ⭐)</p>
              <p className="text-amber-800 mt-0.5">
                우측 상단 파란색 <strong>[배포]</strong> 버튼 → <strong>[새 배포]</strong> 클릭 후:
              </p>
              <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-amber-900 font-medium">
                <li>톱니바퀴 아이콘 클릭 → <strong>'웹 앱'</strong> 선택</li>
                <li>설명: <code>방명록 API</code></li>
                <li>다음 사용자 권한으로 실행: <strong>'나' (내 Google 계정)</strong></li>
                <li>액세스 권한: <strong>'모든 사용자 (Anyone)'</strong> 선택! (비로그인 사용자도 글을 쓰기 위해 필수)</li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
            <div>
              <p className="font-bold text-slate-900">계정 접근 권한 승인</p>
              <p className="text-slate-600 mt-0.5">
                [배포]를 누르면 Google 계정 로그인 및 권한 승인 창이 뜹니다.
                만약 "Google에서 확인하지 않은 앱" 경고가 뜨면 <strong>[고급]</strong> → <strong>[(프로젝트명)(으)로 이동(안전하지 않음)]</strong> → <strong>[허용]</strong>을 누르시면 됩니다.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">6</span>
            <div>
              <p className="font-bold text-emerald-950">발급된 웹 앱 URL 복사 및 연동</p>
              <p className="text-emerald-800 mt-0.5">
                배포 완료 창에 표시된 <strong>웹 앱 URL (https://script.google.com/macros/s/.../exec)</strong>을 복사하여 우리 웹앱의 [시트 연동 설정] 탭에 붙여넣고 [URL 저장]을 누르면 연동 완료!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Code.gs 소스코드</span>
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
                <span>복사되었습니다!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>전체 코드 복사</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-900/90">
          <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
        </div>
      </div>

      {/* Architectural Concept Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">3. 동작 원리 (어떻게 동작하나요?)</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          • <strong>doGet(e)</strong>: 사용자가 방명록 페이지를 열면 브라우저가 Google Apps Script Web App URL로 HTTP GET 요청을 보냅니다. Apps Script가 스프레드시트의 행들을 읽어와 JSON 형태로 반환합니다.<br/>
          • <strong>doPost(e)</strong>: 사용자가 이름과 응원 한마디를 적고 [등록]을 누르면, 브라우저가 HTTP POST 요청으로 작성 데이터를 전송합니다. Apps Script가 스프레드시트 마지막 줄에 <code>appendRow()</code>로 즉시 추가합니다.
        </p>
      </div>
    </div>
  );
};
