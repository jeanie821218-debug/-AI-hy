import React, { useState } from "react";
import { Key, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface ApiKeySidebarSectionProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  hasEnvKey: boolean;
  onUseEnvKey?: () => void;
}

export const ApiKeySidebarSection: React.FC<ApiKeySidebarSectionProps> = ({
  apiKey,
  onSaveApiKey,
  hasEnvKey,
  onUseEnvKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isConfigured = Boolean(apiKey && apiKey.trim() !== "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClear = () => {
    setInputVal("");
    onSaveApiKey("");
  };

  return (
    <div id="sidebar-api-settings-card" className="bg-white/90 rounded-xl border border-slate-200/80 shadow-xs p-3.5 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Key className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-tight">API 설정 (Gemini)</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] font-semibold text-[#005BAC] hover:text-[#004280] transition-colors"
        >
          {isOpen ? "접기" : "설정/수정"}
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
        <span className="text-slate-500 text-[11px]">연결 상태</span>
        {isConfigured ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            등록 완료 (준비됨)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-rose-600 text-[11px]">
            <AlertTriangle className="w-3 h-3" />
            API Key 미입력
          </span>
        )}
      </div>

      {!isConfigured && !isOpen && (
        <p className="mt-2 text-[11px] text-rose-600 leading-tight">
          ⚠️ AI 실시간 검색을 위해 Gemini API Key를 먼저 입력해주세요.
        </p>
      )}

      {/* Expanded Settings Form */}
      {isOpen && (
        <form onSubmit={handleSave} className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full pr-8 pl-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC] text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showKey ? "키 숨기기" : "키 보기"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>키는 서버 DB에 저장되지 않고 <strong>브라우저 세션(sessionStorage)</strong>에서만 안전하게 사용됩니다.</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              id="save-api-key-btn"
              type="submit"
              className="flex-1 py-1.5 px-2 bg-[#005BAC] hover:bg-[#004280] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              키 저장 적용
            </button>
            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors"
              >
                삭제
              </button>
            )}
          </div>

          {hasEnvKey && onUseEnvKey && (
            <button
              type="button"
              onClick={onUseEnvKey}
              className="w-full py-1 text-[11px] text-[#005BAC] hover:underline font-medium text-center"
            >
              시스템 환경 기본 키로 자동 채우기
            </button>
          )}

          {savedSuccess && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-center font-medium">
              ✓ API Key가 안전하게 등록되었습니다!
            </div>
          )}
        </form>
      )}
    </div>
  );
};
