import React, { useState, useEffect } from "react";
import { 
  Droplet, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Calculator, 
  Type, 
  Phone, 
  Menu,
  Sparkles
} from "lucide-react";
import { BranchOffice } from "../types";
import { BusanWaterEmblem } from "./BusanWaterEmblem";
import { BusanCityLogo } from "./BusanCityLogo";

interface HeaderProps {
  selectedBranch: BranchOffice;
  onOpenCalculator: () => void;
  fontSize: "sm" | "base" | "lg";
  onChangeFontSize: (size: "sm" | "base" | "lg") => void;
  onToggleSidebar?: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedBranch,
  onOpenCalculator,
  fontSize,
  onChangeFontSize,
  onToggleSidebar,
  hasApiKey,
}) => {
  // Call timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      {/* Top Metropolitan City Official Micro-bar (matching busan.go.kr official portal) */}
      <div className="bg-slate-50/95 border-b border-slate-200/80 py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2.5">
            {/* Busan Metropolitan City Official Brand Logo (From busan.go.kr) */}
            <div className="flex items-center">
              <BusanCityLogo className="h-4.5 sm:h-5.5" />
            </div>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-slate-600 font-medium hidden md:inline">상수도사업본부 통합 민원행정 지원 시스템</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
            <span className="text-slate-500 hover:text-slate-800">요금/민원</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 hover:text-slate-800">상수도수질</span>
            <span className="text-slate-300">·</span>
            <span className="text-[#005BAC] font-bold">120 콜센터</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              title="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            {/* Busan Water Authority Official Emblem & Brand Title */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center shrink-0">
                <BusanWaterEmblem className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-2xs" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black text-[#005BAC] tracking-tight leading-none">
                    부산광역시 상수도사업본부
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0077CC] tracking-tight leading-tight mt-0.5 font-sans">
                  Busan Water Authority
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-slate-200/90 hidden sm:block" />

            {/* AI Assistant Title & Role (전문가) */}
            <div className="hidden sm:flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-sm sm:text-[15px] font-black tracking-tight text-slate-900 flex items-center gap-1 leading-none">
                  <span className="text-[#00A0E9]">💧</span> 순수AI비서
                </h1>
                <span className="text-[10px] bg-blue-50 text-[#005BAC] border border-blue-200 px-1.5 py-0.2 rounded font-semibold leading-tight">
                  요금팀 전문 행정 지원
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                통합 수도요금 실시간 상담 전문가
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Tools Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Branch Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">{selectedBranch.name}</span>
            <span className="text-slate-400">({selectedBranch.phone})</span>
          </div>

          {/* Call Stopwatch / Timer (Essential for 3-second rapid guidance) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-mono font-bold text-slate-800 min-w-[38px]">
              {formatTime(timerSeconds)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-1 rounded-md transition-colors ${
                isTimerRunning 
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                  : "bg-blue-100 text-[#005BAC] hover:bg-blue-200"
              }`}
              title={isTimerRunning ? "통화 타이머 일시정지" : "통화 시작 (타이머 시작)"}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            {timerSeconds > 0 && (
              <button
                onClick={handleResetTimer}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                title="초기화"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Font Size Adjuster (Teleprompter style for officers on calls) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => onChangeFontSize("sm")}
              className={`px-2 py-1 rounded font-medium transition-all ${
                fontSize === "sm" ? "bg-white text-[#005BAC] font-bold shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              A-
            </button>
            <button
              onClick={() => onChangeFontSize("base")}
              className={`px-2 py-1 rounded font-medium transition-all ${
                fontSize === "base" ? "bg-white text-[#005BAC] font-bold shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              A
            </button>
            <button
              onClick={() => onChangeFontSize("lg")}
              className={`px-2 py-1 rounded font-medium transition-all ${
                fontSize === "lg" ? "bg-white text-[#005BAC] font-bold shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              A+
            </button>
          </div>

          {/* Rate Calculator Quick Modal Trigger */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005BAC] hover:bg-[#004280] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden md:inline">통합 요금 계산기</span>
            <span className="md:hidden">계산기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
