import React, { useState } from "react";
import { Calculator, X, AlertCircle } from "lucide-react";

interface WaterRateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaterRateCalculator: React.FC<WaterRateCalculatorProps> = ({ isOpen, onClose }) => {
  const [usageM3, setUsageM3] = useState<number>(30);
  const [normalUsageM3, setNormalUsageM3] = useState<number>(15);
  const [isLeakageMode, setIsLeakageMode] = useState<boolean>(true);
  const [pipeDiameter, setPipeDiameter] = useState<number>(15); // 15mm standard

  if (!isOpen) return null;

  // Rates approximation based on Busan Metropolitan City Water & Sewerage Ordinances
  // 1. Base fee for 15mm: ~1,080 KRW
  const baseWaterFee = pipeDiameter === 15 ? 1080 : pipeDiameter === 20 ? 1930 : 3400;

  // 2. Water usage fee (domestic household: approx 620 KRW/m3 up to 20m3, 850 KRW/m3 21-30m3, 1100 KRW/m3 >30m3)
  const calculateWaterFee = (qty: number) => {
    let fee = 0;
    if (qty <= 20) {
      fee = qty * 620;
    } else if (qty <= 30) {
      fee = 20 * 620 + (qty - 20) * 850;
    } else {
      fee = 20 * 620 + 10 * 850 + (qty - 30) * 1100;
    }
    return fee;
  };

  // 3. Sewerage fee: approx 560 KRW/m3 up to 20m3, 760 KRW/m3 >20m3
  const calculateSewerFee = (qty: number) => {
    if (qty <= 20) return qty * 560;
    return 20 * 560 + (qty - 20) * 760;
  };

  // 4. Water use fee (물이용부담금): 170 KRW/m3 strictly
  const calculateWaterUseFee = (qty: number) => qty * 170;

  const totalUsage = Math.max(0, usageM3);
  const normalUsage = Math.min(totalUsage, Math.max(0, normalUsageM3));
  const leakQty = Math.max(0, totalUsage - normalUsage);

  // Normal bill without leakage reduction
  const waterPart = baseWaterFee + calculateWaterFee(totalUsage);
  const sewerPart = calculateSewerFee(totalUsage);
  const waterUsePart = calculateWaterUseFee(totalUsage);
  const totalRegularBill = waterPart + sewerPart + waterUsePart;

  // If underground leak reduction applied:
  // 1) Water reduction: 50% of the excess leak portion
  const normalWaterPart = baseWaterFee + calculateWaterFee(normalUsage);
  const excessWaterPart = Math.max(0, waterPart - normalWaterPart);
  const waterDiscount = isLeakageMode ? Math.round(excessWaterPart * 0.5) : 0;

  // 2) Sewerage reduction: 100% of the unreleased leak portion (underground leak does not enter sewer)
  const normalSewerPart = calculateSewerFee(normalUsage);
  const excessSewerPart = Math.max(0, sewerPart - normalSewerPart);
  const sewerDiscount = isLeakageMode ? excessSewerPart : 0;

  // 3) Water use charge adjustment proportional to water reduction
  const waterUseDiscount = isLeakageMode ? Math.round((leakQty * 0.5) * 170) : 0;

  const totalDiscount = waterDiscount + sewerDiscount + waterUseDiscount;
  const finalDiscountedBill = Math.max(0, totalRegularBill - totalDiscount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#005BAC] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">통합 수도요금 & 누수 감면 즉시 계산기</h3>
              <p className="text-xs text-blue-100">부산광역시 수도·하수도 조례 및 물이용부담금 규정 산출식</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Inputs Grid */}
          <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이번 달 총 사용량 (m³)
              </label>
              <input
                type="number"
                min="0"
                value={usageM3}
                onChange={(e) => setUsageM3(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-[#005BAC]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                정상 평균 사용량 (직전 3개월)
              </label>
              <input
                type="number"
                min="0"
                value={normalUsageM3}
                onChange={(e) => setNormalUsageM3(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-[#005BAC]"
              />
            </div>

            <div className="col-span-2 flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLeakageMode}
                  onChange={(e) => setIsLeakageMode(e.target.checked)}
                  className="w-4 h-4 rounded text-[#005BAC] focus:ring-[#005BAC]"
                />
                <span className="text-xs font-bold text-[#005BAC]">
                  옥내 매립 배관 누수 감면 시뮬레이션 적용
                </span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">구경 15mm 가정용 기준</span>
            </div>
          </div>

          {/* 3-Part Breakdown Result */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>고지서 3대 통합 항목별 상세 내역</span>
              <span className="text-[11px] text-slate-500">누수 추정량: {leakQty} m³</span>
            </h4>

            {/* Item 1: 상수도요금 */}
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#005BAC]"></span>
                <span className="font-semibold text-slate-700">1. 상수도 요금</span>
                <span className="text-[10px] text-slate-400">(기본요금 {baseWaterFee.toLocaleString()}원 + 사용료)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{waterPart.toLocaleString()}원</span>
                {isLeakageMode && waterDiscount > 0 && (
                  <span className="text-emerald-600 font-semibold ml-2">(-{waterDiscount.toLocaleString()}원 감면)</span>
                )}
              </div>
            </div>

            {/* Item 2: 하수도요금 */}
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00A0E9]"></span>
                <span className="font-semibold text-slate-700">2. 하수도 요금</span>
                <span className="text-[10px] text-slate-400">(배출 오수 정화 처리비)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{sewerPart.toLocaleString()}원</span>
                {isLeakageMode && sewerDiscount > 0 && (
                  <span className="text-emerald-600 font-semibold ml-2">(-{sewerDiscount.toLocaleString()}원 감면)</span>
                )}
              </div>
            </div>

            {/* Item 3: 물이용부담금 */}
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span className="font-semibold text-slate-700">3. 물이용부담금</span>
                <span className="text-[10px] text-slate-400">(170원/m³ 법정단가)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">{waterUsePart.toLocaleString()}원</span>
                {isLeakageMode && waterUseDiscount > 0 && (
                  <span className="text-emerald-600 font-semibold ml-2">(-{waterUseDiscount.toLocaleString()}원 감면)</span>
                )}
              </div>
            </div>

            {/* Totals Comparison */}
            <div className="pt-2 bg-slate-50 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-slate-500">당초 총 청구액</span>
                <span className="text-sm font-bold text-slate-600 line-through">
                  {totalRegularBill.toLocaleString()}원
                </span>
              </div>
              {isLeakageMode && (
                <div className="text-center">
                  <span className="block text-[11px] text-emerald-600 font-bold">총 감면 혜택</span>
                  <span className="text-base font-extrabold text-emerald-600">
                    -{totalDiscount.toLocaleString()}원
                  </span>
                </div>
              )}
              <div className="text-right">
                <span className="block text-[11px] text-[#005BAC] font-bold">감면 후 최종 납부액</span>
                <span className="text-lg font-black text-[#005BAC]">
                  {finalDiscountedBill.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start gap-2 text-[11px] text-blue-900">
            <AlertCircle className="w-4 h-4 text-[#005BAC] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>민원 상담 핵심 팁:</strong> 옥내 매립 배관 누수 감면은 상수도 누수 초과량 50% 감면뿐만 아니라, <strong>하수도로 배출되지 않은 수량 전액에 대한 하수도 요금도 감면</strong>되므로 민원인에게 두 가지 혜택이 통합 적용됨을 반드시 설명해 주십시오. (고지 후 90일 이내 신청 필수)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
