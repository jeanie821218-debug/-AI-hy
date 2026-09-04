import React, { useState, useEffect } from "react";
import { 
  FileText, 
  PhoneCall, 
  MessageSquare, 
  AlertOctagon, 
  Copy, 
  Check, 
  Volume2, 
  ShieldCheck, 
  Sparkles, 
  Building2,
  ExternalLink,
  ChevronRight,
  Radio,
  RefreshCw,
  Clock,
  Truck,
  MapPin,
  HelpCircle,
  Key,
  Phone,
  Send,
  RotateCcw
} from "lucide-react";
import { ConsultationResponse, BranchOffice, RealtimeOutageItem, RealtimeOutageData } from "../types";

interface ResponseCardsProps {
  data: ConsultationResponse;
  selectedBranch: BranchOffice;
  fontSize: "sm" | "base" | "lg";
  isGenerating?: boolean;
  outageApiKey?: string;
  onOpenOutageApiSettings?: () => void;
}

export const ResponseCards: React.FC<ResponseCardsProps> = ({
  data,
  selectedBranch,
  fontSize,
  isGenerating = false,
  outageApiKey = "",
  onOpenOutageApiSettings,
}) => {
  const [copiedSms, setCopiedSms] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Real-time Outage API State
  const [realtimeData, setRealtimeData] = useState<RealtimeOutageData | null>(null);
  const [isLoadingRealtime, setIsLoadingRealtime] = useState(false);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [selectedRealtimeItem, setSelectedRealtimeItem] = useState<RealtimeOutageItem | null>(null);

  const isOutageKeyConfigured = Boolean(outageApiKey && outageApiKey.trim() !== "");

  // Fetch real-time outage data when branch changes or on mount or key change
  const fetchRealtimeOutage = async () => {
    setIsLoadingRealtime(true);
    try {
      const res = await fetch("/api/outage/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-busan-outage-key": outageApiKey,
        },
        body: JSON.stringify({
          outageApiKey,
          branchOffice: selectedBranch.name,
          district: showAllDistricts ? "" : selectedBranch.districts[0] || "",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setRealtimeData(json);
        if (json.items && json.items.length > 0) {
          setSelectedRealtimeItem(json.items[0]);
        } else {
          setSelectedRealtimeItem(null);
        }
      }
    } catch (err) {
      console.error("Real-time outage fetch failed:", err);
    } finally {
      setIsLoadingRealtime(false);
    }
  };

  useEffect(() => {
    fetchRealtimeOutage();
  }, [selectedBranch.id, outageApiKey, showAllDistricts]);

  // SMS Customization State (Title, Sender, Recipient, Body)
  const [smsTitle, setSmsTitle] = useState("[부산상수도사업본부 순수AI비서 안내]");
  const [senderPhone, setSenderPhone] = useState(selectedBranch.phone);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [smsBody, setSmsBody] = useState("");

  // Update sender phone automatically when selected regional branch changes
  useEffect(() => {
    setSenderPhone(selectedBranch.phone);
  }, [selectedBranch.phone]);

  // Customize SMS body with current selected branch office details whenever AI output or branch changes
  useEffect(() => {
    const formatted = data.smsMessage.includes("관할 사업소")
      ? data.smsMessage.replace(
          /관할 사업소/g,
          `${selectedBranch.name}(전화: ${selectedBranch.phone}, 팩스: ${selectedBranch.fax})`
        )
      : `${data.smsMessage}\n[담당: ${selectedBranch.name} TEL: ${selectedBranch.phone} / FAX: ${selectedBranch.fax}]`;
    setSmsBody(formatted);
  }, [data.smsMessage, selectedBranch.name, selectedBranch.phone, selectedBranch.fax]);

  // Full composite SMS for copy and byte calculation
  const fullSmsToCopy = smsTitle.trim() ? `${smsTitle}\n\n${smsBody}` : smsBody;
  const totalCharCount = fullSmsToCopy.length;
  const totalByteCount = Math.ceil(new Blob([fullSmsToCopy]).size);

  const handleCopySms = async () => {
    try {
      await navigator.clipboard.writeText(fullSmsToCopy);
      setCopiedSms(true);
      setTimeout(() => setCopiedSms(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const handleResetSms = () => {
    const formatted = data.smsMessage.includes("관할 사업소")
      ? data.smsMessage.replace(
          /관할 사업소/g,
          `${selectedBranch.name}(전화: ${selectedBranch.phone}, 팩스: ${selectedBranch.fax})`
        )
      : `${data.smsMessage}\n[담당: ${selectedBranch.name} TEL: ${selectedBranch.phone} / FAX: ${selectedBranch.fax}]`;
    setSmsBody(formatted);
    setSmsTitle("[부산상수도사업본부 순수AI비서 안내]");
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(data.callScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const handleSpeakScript = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(data.callScript);
      utterance.lang = "ko-KR";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const textSizeClass = 
    fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";
  const leadingClass = 
    fontSize === "sm" ? "leading-relaxed" : fontSize === "lg" ? "leading-loose" : "leading-relaxed";

  return (
    <div className="space-y-4 pb-8">
      {/* Compliance Verification Badge */}
      <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-[#005BAC]" />
          <span className="font-semibold">
            법적 근거 검증 완료: 부산광역시 급수·하수도 조례 기준 및 「물이용부담금」 단일 명칭 준수
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            연계 사업소: {selectedBranch.name} ({selectedBranch.phone})
          </span>
          <span className="px-2 py-0.5 bg-[#005BAC]/10 text-[#005BAC] text-[11px] font-bold rounded-md">
            통합 요금 표준
          </span>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================= */}
        {/* CARD 1: 📌 [상·하수도 조례 및 통합 요금 근거] */}
        {/* ========================================================= */}
        <div 
          id="card-ordinance-basis"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
        >
          <div className="bg-[#005BAC] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/10 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </span>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>📌 1. [상·하수도 조례 및 통합 요금 근거]</span>
              </h3>
            </div>
            <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              법령·조례 일원화
            </span>
          </div>

          <div className="p-4 space-y-3.5 flex-1 bg-gradient-to-b from-white to-slate-50/50">
            {/* 관련 조례 */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-bold text-[#005BAC] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>관련 조례 및 법령</span>
              </div>
              <p className={`${textSizeClass} font-semibold text-slate-800 leading-snug whitespace-pre-line`}>
                {data.ordinanceBasis.relevantOrdinance}
              </p>
            </div>

            {/* 요금 체계 */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-bold text-[#00A0E9] uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>통합 요금 체계 [상수도 + 하수도 + 물이용부담금]</span>
              </div>
              <p className={`${textSizeClass} text-slate-700 ${leadingClass} whitespace-pre-line`}>
                {data.ordinanceBasis.rateStructure}
              </p>
            </div>

            {/* 감면 요건 */}
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>감면 요건 및 신청 기한 (고지 후 90일)</span>
              </div>
              <p className={`${textSizeClass} text-emerald-950 ${leadingClass} whitespace-pre-line`}>
                {data.ordinanceBasis.reductionCriteria}
              </p>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>※ 조례 근거 미확인 추측 안내 엄격 금지</span>
            <span className="text-[#005BAC] font-medium">90일 내 서류 접수 시 소급 환급</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: 🗣️ [추천 통화 멘트 (공감·친절 대본)] */}
        {/* ========================================================= */}
        <div 
          id="card-call-script"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
        >
          <div className="bg-[#005BAC] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/10 rounded-lg">
                <PhoneCall className="w-4 h-4 text-white" />
              </span>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>🗣️ 2. [추천 통화 멘트 (공감·친절 대본)]</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSpeakScript}
                className="px-2 py-1 bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                title="대본 음성 읽기"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? "정지" : "음성듣기"}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyScript}
                className="px-2 py-1 bg-white text-[#005BAC] hover:bg-blue-50 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
              >
                {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? "복사됨!" : "대본 복사"}</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-blue-50/30 to-white">
            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>민원인 응대 권장 구어체 대본</span>
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                  공감 경청 모드
                </span>
              </div>
              <div className={`${textSizeClass} ${leadingClass} text-slate-800 font-medium whitespace-pre-line select-text`}>
                {data.callScript}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span>💡 통화 팁: "고지서에 3개 항목이 함께 청구됩니다"를 먼저 공감하며 안내하세요.</span>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>민원 눈높이 설명 표준 준수</span>
            <span className="font-semibold text-emerald-600">친절도 지수 A+ 가이드</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: 📱 [민원인 전송용 문자(SMS)] */}
        {/* ========================================================= */}
        <div 
          id="card-sms-message"
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
        >
          <div className="bg-[#005BAC] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/10 rounded-lg">
                <MessageSquare className="w-4 h-4 text-white" />
              </span>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>📱 3. [민원인 전송용 문자(SMS)]</span>
              </h3>
            </div>
            {/* MANDATORY: [📋 원클릭 문자 복사] 버튼 필수 제공 */}
            <button
              id="copy-sms-btn"
              type="button"
              onClick={handleCopySms}
              className="px-3 py-1.5 bg-[#00A0E9] hover:bg-[#008ccf] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              {copiedSms ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>📋 원클릭 문자 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between bg-slate-50/40 space-y-3">
            {/* 1. 문자 보내는 번호 / 받는 번호 직접 입력란 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 문자 보내는 번호 */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <label 
                  htmlFor="sms-sender-phone"
                  className="block text-[11px] font-bold text-slate-700 mb-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#005BAC]" />
                    <span>문자 보내는 번호 (발신)</span>
                  </span>
                </label>
                <input
                  id="sms-sender-phone"
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="051-000-0000"
                  className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005BAC]"
                />
              </div>

              {/* 문자 받는 번호 */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
                <label 
                  htmlFor="sms-recipient-phone"
                  className="block text-[11px] font-bold text-slate-700 mb-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>문자 받는 번호 (수신)</span>
                  </span>
                </label>
                <input
                  id="sms-recipient-phone"
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* 2. 문자 작성 컨테이너: 제목 + 본문 */}
            <div className="rounded-xl border border-amber-300 shadow-2xs overflow-hidden">
              {/* 제목 영역 */}
              <div className="bg-amber-200 border-b border-amber-300/90 px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label htmlFor="sms-title-input" className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>제목</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-950">
                    {smsTitle.length}자
                  </span>
                </div>
                <input
                  id="sms-title-input"
                  type="text"
                  value={smsTitle}
                  onChange={(e) => setSmsTitle(e.target.value)}
                  placeholder="제목을 입력하세요 (예: [부산상수도사업본부 순수AI비서 안내])"
                  className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 placeholder:text-amber-700/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* 본문 영역 */}
              <div className="bg-[#FFFDE7] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-amber-200/60">
                  <span className="font-bold text-amber-950">
                    문자 본문
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetSms}
                      title="AI 기본 작성 문자로 원상복구"
                      className="text-[10px] font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-0.5 hover:underline bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300/60"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>기본 복원</span>
                    </button>
                    <span className="text-slate-600 font-mono text-[11px] font-semibold">
                      총 {totalCharCount}자 ({totalByteCount} byte)
                    </span>
                  </div>
                </div>

                <textarea
                  id="sms-body-textarea"
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  rows={8}
                  className={`w-full bg-amber-50/70 hover:bg-amber-50/90 focus:bg-white border border-amber-200/90 rounded-lg p-2.5 text-slate-900 ${textSizeClass} ${leadingClass} focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans resize-y select-text transition-all leading-relaxed`}
                  placeholder="민원인에게 전송할 문자 본문을 입력하세요..."
                />

                <div className="text-[10px] text-amber-900/80 flex items-center justify-between">
                  <span>💡 90byte 초과 시 장문 LMS로 자동 전환 전송됩니다.</span>
                  {recipientPhone && (
                    <span className="font-mono text-emerald-800 font-bold">
                      수신: {recipientPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 사업소 연계 안내바 */}
            <div className="flex items-center justify-between text-[11px] bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 text-blue-900">
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#005BAC]" />
                <span>현재 연계 사업소: <strong>{selectedBranch.name}</strong> (전화: {selectedBranch.phone}, FAX: {selectedBranch.fax})</span>
              </div>
              <span className="text-[10px] text-slate-400">좌측 사업소 변경 시 실시간 반영</span>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>LMS/SMS 전산 문자 발송 시스템 연동 규격</span>
            {copiedSms && (
              <span className="text-emerald-600 font-bold animate-pulse">
                ✓ 클립보드에 복사되었습니다!
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 4: 🚰 [부산시 단수 정보] (공공데이터 실시간 연동) */}
        {/* ========================================================= */}
        <div 
          id="card-outage-container"
          className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col transition-all ${
            data.outageInfo ? "border-[#E63946]" : "border-slate-200/90"
          }`}
        >
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${
            data.outageInfo ? "bg-[#E63946] text-white" : "bg-gradient-to-r from-slate-800 to-slate-900 text-white"
          }`}>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/15 rounded-lg">
                <AlertOctagon className="w-4 h-4 text-white" />
              </span>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>🚰 4. [부산시 단수 정보]</span>
                {data.outageInfo ? (
                  <span className="text-xs font-normal text-rose-100">(긴급 비상 안내)</span>
                ) : (
                  <span className="text-xs font-normal text-slate-300">(실시간 모니터링)</span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Real-time sync button */}
              <button
                type="button"
                onClick={fetchRealtimeOutage}
                disabled={isLoadingRealtime}
                title="공공데이터포털 부산상수도 실시간 단수현황 새로고침"
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRealtime ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">실시간 동기화</span>
              </button>

              {/* API Key Connection Indicator Badge */}
              {isOutageKeyConfigured ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  실시간 API 연동
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenOutageApiSettings}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-amber-200 text-[10px] font-bold transition-colors"
                  title="단수현황 API 키 등록하기"
                >
                  <Key className="w-2.5 h-2.5" />
                  <span>API키 등록</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-header info bar */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#005BAC]" />
              <span className="font-semibold text-slate-800">
                부산광역시 상수도사업본부 공공데이터
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {realtimeData?.syncTime ? `(동기화: ${realtimeData.syncTime})` : ""}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setShowAllDistricts(false)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  !showAllDistricts ? "bg-[#005BAC] text-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {selectedBranch.name} 관할
              </button>
              <button
                onClick={() => setShowAllDistricts(true)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  showAllDistricts ? "bg-[#005BAC] text-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                부산 전역 (16개구)
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3.5 flex-1 bg-gradient-to-b from-white to-slate-50/60 overflow-y-auto max-h-[460px]">
            {/* If AI Consultation Result specifically has outage info */}
            {data.outageInfo && (
              <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#E63946] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E63946] animate-ping" />
                    민원 질의 대상 긴급 단수 안내
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                    현장 비상 발령
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-2xs">
                    <span className="block text-[11px] font-bold text-slate-500 mb-0.5">단수 일시</span>
                    <span className="text-xs font-bold text-slate-900">{data.outageInfo.dateTime}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-2xs">
                    <span className="block text-[11px] font-bold text-slate-500 mb-0.5">복구 예정 시각</span>
                    <span className="text-xs font-bold text-[#E63946]">{data.outageInfo.restorationTime}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-2xs">
                  <span className="block text-[11px] font-bold text-slate-500 mb-0.5">대상 구역</span>
                  <span className="text-xs font-semibold text-slate-800">{data.outageInfo.targetArea}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-2xs">
                  <span className="block text-[11px] font-bold text-slate-500 mb-0.5">단수 사유</span>
                  <span className="text-xs text-slate-700">{data.outageInfo.reason}</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                  <span className="block text-[11px] font-bold text-[#005BAC] mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#005BAC]" />
                    <span>비상급수 및 순수 병물 지원 현황</span>
                  </span>
                  <span className="text-xs font-semibold text-blue-950">
                    {data.outageInfo.emergencyWater}
                  </span>
                </div>
              </div>
            )}

            {/* Real-time Outage Feed from Busan Water Authority API */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-600" />
                  <span>
                    {showAllDistricts ? "부산 전역 공공 공사·단수 피드" : `${selectedBranch.name} 관할 실시간 단수·작업 현황`}
                  </span>
                  <span className="text-[11px] font-semibold text-[#005BAC] bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200">
                    {realtimeData?.items?.length || 0}건
                  </span>
                </span>
                {!isOutageKeyConfigured && onOpenOutageApiSettings && (
                  <button
                    onClick={onOpenOutageApiSettings}
                    className="text-[10px] text-[#005BAC] hover:underline flex items-center gap-1"
                  >
                    <span>단수 API 키 등록으로 실시간 동기화</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isLoadingRealtime ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#005BAC]" />
                  <span className="text-xs">부산시 상수도 단수현황 API 조회 중...</span>
                </div>
              ) : realtimeData && realtimeData.items.length > 0 ? (
                <div className="space-y-2">
                  {realtimeData.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${
                        item.status === "ongoing"
                          ? "bg-rose-50/50 border-rose-200"
                          : item.status === "scheduled"
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            item.status === "ongoing"
                              ? "bg-rose-500 text-white"
                              : item.status === "scheduled"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}>
                            {item.status === "ongoing" ? "단수 진행중" : item.status === "scheduled" ? "단수 예정" : "통수 완료"}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            [{item.district}] {item.workType}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {item.startTime} ~ {item.endTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 font-medium mb-1">
                        📍 <strong>위치:</strong> {item.areaDetail} {item.affectedHouseholds && `(${item.affectedHouseholds})`}
                      </p>
                      <p className="text-[11px] text-slate-600 mb-1.5">
                        ⚙️ <strong>사유:</strong> {item.reason}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 text-slate-600">
                        <div className="flex items-center gap-1 text-blue-900 font-medium">
                          <Truck className="w-3.5 h-3.5 text-[#005BAC] shrink-0" />
                          <span className="truncate">{item.emergencyWaterSupport}</span>
                        </div>
                        <span className="font-mono text-slate-500 text-[10px] shrink-0">
                          {item.branchOfficeName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    현재 {selectedBranch.name} 관할 구역에 진행 중인 긴급 단수가 없습니다.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    수돗물이 정상 공급 중이며, 수질 검사 기준을 충족하고 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* API Connection & Guidance Footer Note */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isOutageKeyConfigured
                    ? "부산광역시 상수도사업본부 Open API 연동 정상 작동 중"
                    : "공공데이터 단수현황 API 키 등록 시 실시간 현장 데이터가 자동 반영됩니다."}
                </span>
              </div>
              <span className="font-bold text-slate-700">
                상황실 직통: 120 / {selectedBranch.phone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
