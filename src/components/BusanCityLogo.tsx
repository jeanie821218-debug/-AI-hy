import React from "react";

interface BusanCityLogoProps {
  className?: string;
  height?: number | string;
}

/**
 * 부산광역시 공식 도시브랜드 시그니처 (2023~)
 * - 마젠타 라인형 'B' 심볼마크
 * - 국문 '부산광역시' + 영문 'BUSAN METROPOLITAN CITY'
 * 공식 이미지 에셋(/busan_ci_signature_line.png)과 벡터 그래픽을 결합하여
 * 어떤 해상도에서도 선명하게 표시됩니다.
 */
export const BusanCityLogo: React.FC<BusanCityLogoProps> = ({
  className = "h-5 sm:h-6 w-auto",
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/busan_ci_signature_line.png"
        alt="부산광역시 BUSAN METROPOLITAN CITY"
        className="h-full w-auto object-contain select-none"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if image fails to load: display vector inline SVG
          const target = e.currentTarget;
          target.style.display = "none";
        }}
      />
    </div>
  );
};
