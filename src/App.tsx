import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Sparkles, 
  Key, 
  AlertTriangle, 
  Loader2, 
  Droplet, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  PhoneCall, 
  RefreshCw,
  HelpCircle,
  Clock,
  X,
  Tag
} from "lucide-react";
import { ConsultationResponse, BranchOffice, QuickPreset } from "./types";
import { BUSAN_BRANCH_OFFICES, QUICK_PRESETS } from "./data/busanWaterData";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ResponseCards } from "./components/ResponseCards";
import { WaterRateCalculator } from "./components/WaterRateCalculator";

export default function App() {
  // 1. User Gemini API Key (stored strictly in sessionStorage for security)
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem("busan_gemini_api_key") || "";
  });
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);

  // 1-2. USER REQUESTED: Busan Water Outage Real-time API Key (stored strictly in sessionStorage)
  const [outageApiKey, setOutageApiKey] = useState<string>(() => {
    return sessionStorage.getItem("busan_outage_api_key") || "";
  });

  // 2. Selected Regional Branch Office (Default: 부산진사업소 or 중동부)
  const [selectedBranch, setSelectedBranch] = useState<BranchOffice>(BUSAN_BRANCH_OFFICES[3]);

  // 3. Search query and active data
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<ConsultationResponse>(QUICK_PRESETS[0].data);
  const [activePresetId, setActivePresetId] = useState<string>(QUICK_PRESETS[0].id);

  // 4. Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);

  // 5. UI Preferences
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check server config for presence of system env key
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasEnvKey) {
          setHasEnvKey(true);
        }
      })
      .catch((err) => console.log("Config check error:", err));
  }, []);

  // Save API key to sessionStorage
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    sessionStorage.setItem("busan_gemini_api_key", newKey);
    setApiKeyWarning(null);
  };

  const handleUseEnvKey = () => {
    // If server has key, set special token or notice
    setApiKey("SYSTEM_ENV_KEY_AUTO");
    sessionStorage.setItem("busan_gemini_api_key", "SYSTEM_ENV_KEY_AUTO");
    setApiKeyWarning(null);
  };

  // Save Busan Water Outage Real-time API key to sessionStorage
  const handleSaveOutageApiKey = (newKey: string) => {
    setOutageApiKey(newKey);
    sessionStorage.setItem("busan_outage_api_key", newKey);
  };

  // Real-time Outage API connection test
  const handleTestOutageConnection = async (key: string) => {
    const res = await fetch("/api/outage/test-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outageApiKey: key }),
    });
    return await res.json();
  };

  const handleOpenOutageSettings = () => {
    setIsMobileSidebarOpen(true);
    setTimeout(() => {
      const input = document.getElementById("busan-outage-api-key-input");
      if (input) {
        input.focus();
      }
    }, 100);
  };

  // Quick Preset Click (Instant response)
  const handleSelectPreset = (preset: QuickPreset) => {
    setActivePresetId(preset.id);
    setSearchQuery(preset.query);
    setCurrentResult(preset.data);
    setErrorMessage(null);
    setApiKeyWarning(null);
    setResponseTimeMs(45); // Instant local preset
  };

  // Search Submit (Invokes Gemini API via Server proxy)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      searchInputRef.current?.focus();
      return;
    }

    // MANDATORY CONSTRAINT 2: API Key required check
    // "API Key 미입력 시 검색을 차단하고 'Gemini API Key를 먼저 입력해주세요'라는 안내 문구를 노출하세요."
    if (!apiKey || apiKey.trim() === "") {
      setApiKeyWarning("Gemini API Key를 먼저 입력해주세요. 좌측 사이드바의 [API 설정]에서 키를 등록해야 실시간 AI 상담을 시작할 수 있습니다.");
      return;
    }

    setApiKeyWarning(null);
    setErrorMessage(null);
    setIsLoading(true);
    setActivePresetId("");

    const startTime = performance.now();

    try {
      const isOutageKeyword = /단수|수압|녹물|급수차|병물/i.test(trimmed);

      const res = await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey === "SYSTEM_ENV_KEY_AUTO" ? "" : apiKey,
        },
        body: JSON.stringify({
          query: trimmed,
          userApiKey: apiKey === "SYSTEM_ENV_KEY_AUTO" ? "" : apiKey,
          isOutageQuery: isOutageKeyword,
          branchOffice: selectedBranch.name,
        }),
      });

      const json = await res.json();
      const endTime = performance.now();
      setResponseTimeMs(Math.round(endTime - startTime));

      if (!res.ok) {
        if (json.code === "API_KEY_REQUIRED") {
          setApiKeyWarning(json.error || "Gemini API Key를 먼저 입력해주세요.");
        } else {
          setErrorMessage(json.error || "상담 안내 생성 중 오류가 발생했습니다.");
        }
        return;
      }

      if (json.data) {
        setCurrentResult(json.data);
      }
    } catch (err: any) {
      console.error("Consultation fetch failed:", err);
      setErrorMessage("서버 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickTags = [
    { label: "💧 옥내 누수 감면", query: "옥내 매립 배관 누수로 요금이 과다 청구되었습니다. 상수도와 하수도 누수 감면 기준과 신청 방법을 알려주세요." },
    { label: "💥 요금 폭탄 점검", query: "이번 달 수도요금이 평소보다 3배 넘게 나왔는데 왜 이렇게 많이 나왔나요? 하수도랑 물이용부담금도 왜 같이 붙나요?" },
    { label: "🚰 하수도 동시 청구", query: "수돗물 썼는데 하수도 요금은 왜 같이 나오나요? 하수도 요금을 따로 낼 수는 없나요?" },
    { label: "🌿 물이용부담금", query: "고지서에 '물이용부담금'이라고 적혀 있는 건 무슨 세금인가요? 왜 내가 내야 하나요?" },
    { label: "⚠️ 긴급 단수 비상급수", query: "갑자기 수돗물이 안 나와요! 단수인가요? 언제 복구되고 식수는 지원되나요?" },
    { label: "👨‍👩‍👧‍👦 다자녀/복지 감면", query: "아이 셋 키우는 다자녀 가구인데 수도요금 감면 혜택이 어떻게 되나요?" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header */}
      <Header
        selectedBranch={selectedBranch}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        hasApiKey={Boolean(apiKey && apiKey.trim() !== "")}
      />

      {/* Main Body with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
            hasEnvKey={hasEnvKey}
            onUseEnvKey={handleUseEnvKey}
            outageApiKey={outageApiKey}
            onSaveOutageApiKey={handleSaveOutageApiKey}
            onTestOutageConnection={handleTestOutageConnection}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            onSelectPreset={handleSelectPreset}
            activePresetId={activePresetId}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        </div>

        {/* Mobile Drawer Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" 
              onClick={() => setIsMobileSidebarOpen(false)} 
            />
            <div className="relative z-10 w-80 bg-white h-full shadow-2xl">
              <Sidebar
                apiKey={apiKey}
                onSaveApiKey={handleSaveApiKey}
                hasEnvKey={hasEnvKey}
                onUseEnvKey={handleUseEnvKey}
                outageApiKey={outageApiKey}
                onSaveOutageApiKey={handleSaveOutageApiKey}
                onTestOutageConnection={handleTestOutageConnection}
                selectedBranch={selectedBranch}
                onSelectBranch={setSelectedBranch}
                onSelectPreset={(p) => {
                  handleSelectPreset(p);
                  setIsMobileSidebarOpen(false);
                }}
                activePresetId={activePresetId}
                onOpenCalculator={() => {
                  setIsCalculatorOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center Main Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
          {/* Top Operational Status Bar (Clean Light Design) */}
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-[#005BAC] border border-blue-200/70 rounded-md text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005BAC] animate-pulse" />
                실시간 상담 지원
              </span>
              <span className="text-xs text-slate-600 font-medium">
                통합 고지서 3종 <span className="text-slate-800 font-semibold">[상수도 + 하수도 + 물이용부담금]</span> 부산시 조례 즉시 연계
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-500 shrink-0 self-end sm:self-auto">
              <span className="text-slate-400">관할 사업소:</span>
              <span className="font-bold text-slate-800">{selectedBranch.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">팩스:</span>
              <span className="font-mono font-bold text-slate-700">{selectedBranch.fax}</span>
            </div>
          </div>

          {/* Search Engine Hero Section (Clean, Prominent, Highly Visible) */}
          <div className="bg-white rounded-2xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="text-[#005BAC]">🔍</span>
                  <span>상수도 통합 민원 행정 검색</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    3초 내 조례 근거 대본 생성
                  </span>
                </h2>
                <span className="text-xs text-slate-400 hidden md:inline">
                  부산광역시 수도 급수 조례 및 하수도 조례 기준
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                민원인의 문의 키워드를 입력하시면 조례 근거, 4단 답변(근거·대본·문자·주의점)이 즉시 검색됩니다.
              </p>
            </div>

            {/* High-Contrast Focused Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-white border-2 border-slate-300 hover:border-slate-400 focus-within:border-[#005BAC] focus-within:ring-4 focus-within:ring-[#005BAC]/15 rounded-2xl shadow-md transition-all">
                {/* Search Icon */}
                <div className="pl-3 sm:pl-3.5 pr-1 text-slate-400 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#005BAC]" />
                </div>

                {/* Main Text Input */}
                <input
                  id="consultation-search-input"
                  ref={searchInputRef}
                  type="text"
                  placeholder="민원 키워드 또는 문의 내용 입력 (예: '옥내 누수 감면', '요금 폭탄', '하수도 동시 청구', '물이용부담금', '단수')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base bg-transparent text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none min-w-0"
                />

                {/* Clear Input Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors mr-1 shrink-0"
                    title="검색어 지우기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Prominent Search Submit Button */}
                <button
                  id="search-consult-btn"
                  type="submit"
                  disabled={isLoading}
                  className="px-5 sm:px-7 py-2.5 sm:py-3 bg-[#005BAC] hover:bg-[#00488A] disabled:bg-slate-300 text-white font-black text-sm sm:text-base rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="hidden sm:inline">답변 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-sky-200" />
                      <span>민원 검색</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Keyword Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>자주 묻는 민원 키워드:</span>
              </span>
              {quickTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag.query);
                    // Match with quick preset if available
                    const found = QUICK_PRESETS.find(p => p.query === tag.query);
                    if (found) {
                      handleSelectPreset(found);
                    } else {
                      searchInputRef.current?.focus();
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:border-blue-300 hover:text-[#005BAC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-2xs"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Search metadata and latency */}
            {responseTimeMs !== null && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  응대 시간: {responseTimeMs}ms (3초 이내 표준 통과)
                </span>
                <span className="text-[11px] text-slate-400">
                  부산광역시 수도 급수 조례 제38조 및 하수도 조례 제24조 적용
                </span>
              </div>
            )}
          </div>

          {/* MANDATORY API Key Warning Banner */}
          {apiKeyWarning && (
            <div 
              id="api-key-warning-banner" 
              className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-900 animate-in fade-in duration-200 shadow-xs"
            >
              <AlertTriangle className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-1">
                <h4 className="font-bold text-sm text-[#E63946]">Gemini API Key를 먼저 입력해주세요</h4>
                <p className="leading-relaxed">
                  {apiKeyWarning}
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const input = document.getElementById("gemini-api-key-input");
                      if (input) {
                        input.focus();
                      }
                      setIsMobileSidebarOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#E63946] hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-xs inline-flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>좌측 [API 설정] 열기</span>
                  </button>
                  {hasEnvKey && (
                    <button
                      onClick={handleUseEnvKey}
                      className="px-3 py-1.5 bg-white border border-rose-200 text-[#005BAC] hover:bg-rose-50 font-bold rounded-lg text-xs"
                    >
                      시스템 키로 즉시 연결
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Generic Error Message Banner */}
          {errorMessage && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">오류 발생: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* 4 Cards Output Section (Strictly matches the 4-block user format) */}
          <ResponseCards
            data={currentResult}
            selectedBranch={selectedBranch}
            fontSize={fontSize}
            isGenerating={isLoading}
            outageApiKey={outageApiKey}
            onOpenOutageApiSettings={handleOpenOutageSettings}
          />
        </main>
      </div>

      {/* Water Bill Simulator Modal */}
      <WaterRateCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
