import React from "react";
import { 
  Building2, 
  Flame, 
  Droplets, 
  AlertTriangle, 
  HelpCircle, 
  Phone, 
  Printer, 
  Calculator, 
  BookOpen, 
  X,
  ExternalLink
} from "lucide-react";
import { BranchOffice, QuickPreset } from "../types";
import { BUSAN_BRANCH_OFFICES, QUICK_PRESETS } from "../data/busanWaterData";
import { ApiKeySidebarSection } from "./ApiKeySidebarSection";
import { OutageApiKeySidebarSection } from "./OutageApiKeySidebarSection";

interface SidebarProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  hasEnvKey: boolean;
  onUseEnvKey?: () => void;
  outageApiKey: string;
  onSaveOutageApiKey: (key: string) => void;
  onTestOutageConnection?: (key: string) => Promise<{ success: boolean; message: string }>;
  selectedBranch: BranchOffice;
  onSelectBranch: (branch: BranchOffice) => void;
  onSelectPreset: (preset: QuickPreset) => void;
  activePresetId?: string;
  onOpenCalculator: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey,
  onSaveApiKey,
  hasEnvKey,
  onUseEnvKey,
  outageApiKey,
  onSaveOutageApiKey,
  onTestOutageConnection,
  selectedBranch,
  onSelectBranch,
  onSelectPreset,
  activePresetId,
  onOpenCalculator,
  onCloseMobile,
}) => {
  return (
    <aside className="w-80 shrink-0 bg-slate-100/80 border-r border-slate-200/90 flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Mobile Close Button */}
      {onCloseMobile && (
        <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200">
          <span className="font-bold text-xs text-slate-700">순수AI비서 사이드바</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. MANDATORY: User's Gemini API Key Settings Menu */}
      <ApiKeySidebarSection
        apiKey={apiKey}
        onSaveApiKey={onSaveApiKey}
        hasEnvKey={hasEnvKey}
        onUseEnvKey={onUseEnvKey}
      />

      {/* 1-2. USER REQUESTED: Dedicated Busan Water Outage API Key Registration Menu */}
      <OutageApiKeySidebarSection
        outageApiKey={outageApiKey}
        onSaveOutageApiKey={onSaveOutageApiKey}
        onTestConnection={onTestOutageConnection}
      />

      {/* 2. Branch Office Selector (부산 11개 지역사업소 연계) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#005BAC]" />
            <span>관할 지역 사업소 (11개)</span>
          </label>
          <span className="text-[10px] text-slate-400">문자 접수처 자동연동</span>
        </div>

        <select
          id="branch-office-select"
          value={selectedBranch.id}
          onChange={(e) => {
            const found = BUSAN_BRANCH_OFFICES.find((b) => b.id === e.target.value);
            if (found) onSelectBranch(found);
          }}
          className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-[#005BAC]"
        >
          {BUSAN_BRANCH_OFFICES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.districts.join(", ")})
            </option>
          ))}
        </select>

        {/* Selected Branch Contact Card */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">직통 전화:</span>
            <span className="font-bold text-slate-800">{selectedBranch.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">팩스(FAX):</span>
            <span className="font-bold text-slate-800">{selectedBranch.fax}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">관할 구역:</span>
            <span className="font-medium text-[#005BAC]">{selectedBranch.districts.join(" · ")}</span>
          </div>
        </div>
      </div>

      {/* 3. 3-Second One-Click Quick Presets (통화 중 3초 즉시 응대 키워드) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>3초 퀵 전문가</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">실시간 표준 대본</span>
        </div>

        <div className="space-y-1.5">
          {QUICK_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-[#005BAC] shadow-xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    preset.category === "감면"
                      ? "bg-emerald-100 text-emerald-800"
                      : preset.category === "단수"
                      ? "bg-rose-100 text-rose-800"
                      : preset.category === "물이용부담금"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-blue-100 text-[#005BAC]"
                  }`}>
                    {preset.category}
                  </span>
                  {preset.isOutage && (
                    <span className="text-[10px] text-[#E63946] font-bold">긴급 공지</span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                  {preset.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {preset.shortDesc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Rule Cheatsheet (공무원 상담 필수 참조) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <BookOpen className="w-3.5 h-3.5 text-[#005BAC]" />
          <span>부산시 필수 조례 요약</span>
        </div>
        <div className="text-[11px] text-slate-600 space-y-1.5 leading-tight">
          <div className="p-1.5 bg-slate-50 rounded-lg">
            <strong className="text-slate-800">옥내 매립 배관 누수:</strong>
            <p className="text-slate-500 mt-0.5">상수도 초과분 50% 감면 + 하수도 미배출량 감면 (고지 후 90일 내)</p>
          </div>
          <div className="p-1.5 bg-slate-50 rounded-lg">
            <strong className="text-slate-800">물이용부담금:</strong>
            <p className="text-slate-500 mt-0.5">전 수종 톤당 170원 (특정 수계 명칭 사용 절대 금지!)</p>
          </div>
        </div>

        <button
          onClick={onOpenCalculator}
          className="w-full mt-2 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-[#005BAC] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>통합 요금 & 누수 감면 시뮬레이터</span>
        </button>
      </div>

      {/* Footnote */}
      <div className="pt-2 text-[10px] text-slate-400 text-center">
        부산광역시 상수도사업본부 통합 상담 시스템 v2.5
      </div>
    </aside>
  );
};
