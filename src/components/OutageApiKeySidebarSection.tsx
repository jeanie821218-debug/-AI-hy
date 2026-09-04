import React, { useState } from "react";
import { 
  Droplet, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  ExternalLink,
  HelpCircle
} from "lucide-react";

interface OutageApiKeySidebarSectionProps {
  outageApiKey: string;
  onSaveOutageApiKey: (key: string) => void;
  onTestConnection?: (key: string) => Promise<{ success: boolean; message: string; count?: number }>;
}

export const OutageApiKeySidebarSection: React.FC<OutageApiKeySidebarSectionProps> = ({
  outageApiKey,
  onSaveOutageApiKey,
  onTestConnection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(outageApiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isConfigured = Boolean(outageApiKey && outageApiKey.trim() !== "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOutageApiKey(inputVal.trim());
    setSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClear = () => {
    setInputVal("");
    onSaveOutageApiKey("");
    setTestResult(null);
  };

  const handleTest = async () => {
    const keyToTest = inputVal.trim() || outageApiKey.trim();
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: "테스트할 API 키를 먼저 입력해주세요.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      if (onTestConnection) {
        const result = await onTestConnection(keyToTest);
        setTestResult(result);
      } else {
        const res = await fetch("/api/outage/test-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outageApiKey: keyToTest }),
        });
        const data = await res.json();
        setTestResult({
          success: data.success,
          message: data.message || (data.success ? "연결 성공" : "연결 실패"),
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "단수현황 API 서버 응답 확인에 실패했습니다.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="sidebar-outage-api-settings-card" className="bg-white/90 rounded-xl border border-slate-200/80 shadow-2xs p-3.5 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isConfigured ? 'bg-cyan-50 text-[#005BAC]' : 'bg-amber-50 text-amber-600'}`}>
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 tracking-tight">단수현황 API 설정</span>
              <span className="text-[10px] bg-cyan-50 text-[#005BAC] border border-cyan-200 px-1 py-0.2 rounded font-semibold">
                부산상수도 실시간
              </span>
            </div>
          </div>
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
        <span className="text-slate-500 text-[11px]">실시간 연동</span>
        {isConfigured ? (
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            공공데이터 연동 활성
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-slate-500 text-[11px]">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            미등록 (기본 공지)
          </span>
        )}
      </div>

      {!isConfigured && !isOpen && (
        <p className="mt-1.5 text-[11px] text-slate-500 leading-tight">
          💡 공공데이터포털 부산광역시 상수도 단수현황 API키를 등록하면 실시간 단수·수압 공지가 연동됩니다.
        </p>
      )}

      {/* Expanded Settings Form */}
      {isOpen && (
        <form onSubmit={handleSave} className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <span>공공데이터포털 서비스키 (단수현황)</span>
              </label>
              <a
                href="https://www.data.go.kr"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#005BAC] hover:underline flex items-center gap-0.5"
              >
                <span>data.go.kr</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="relative">
              <input
                id="busan-outage-api-key-input"
                type={showKey ? "text" : "password"}
                placeholder="부산광역시_상수도사업본부_단수현황 API 서비스키..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full pr-8 pl-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005BAC] focus:ring-1 focus:ring-[#005BAC] text-slate-800 font-mono"
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

          <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg leading-relaxed space-y-1">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>부산광역시 상수도사업본부 Open API 연계</span>
            </div>
            <p>
              등록된 키는 브라우저 세션에 안전하게 저장되며, 4번 카드 <strong>[부산시 단수 정보]</strong>에서 실시간 단수·복구 공사·비상급수 현황을 자동 조회합니다.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                id="save-outage-key-btn"
                type="submit"
                className="flex-1 py-1.5 px-2 bg-[#005BAC] hover:bg-[#004280] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
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

            <button
              id="test-outage-key-btn"
              type="button"
              disabled={isTesting || (!inputVal.trim() && !outageApiKey.trim())}
              onClick={handleTest}
              className="w-full py-1.5 px-2 bg-cyan-50 hover:bg-cyan-100 text-[#005BAC] border border-cyan-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>실시간 API 연결 테스트 중...</span>
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3" />
                  <span>⚡ 실시간 연동 테스트</span>
                </>
              )}
            </button>
          </div>

          {/* Test or Save Result feedback */}
          {savedSuccess && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-center font-medium">
              ✓ 단수현황 API Key가 안전하게 등록되었습니다!
            </div>
          )}

          {testResult && (
            <div className={`text-[11px] rounded px-2.5 py-1.5 border leading-tight ${
              testResult.success 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}>
              <div className="font-semibold flex items-center gap-1">
                {testResult.success ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>연결 확인 완료</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>연결 오류</span>
                  </>
                )}
              </div>
              <p className="mt-0.5 text-[10px]">{testResult.message}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
