import React from "react";

interface BusanWaterEmblemProps {
  className?: string;
}

/**
 * 부산광역시 상수도사업본부 (Busan Water Authority) 공식 심볼마크 (Emblem)
 * 청정 자연을 상징하는 그린/에메랄드 유선형 곡선과
 * 깨끗하고 안전한 수돗물(순수365)을 상징하는 딥블루 물방울로 구성된 공식 CI
 */
export const BusanWaterEmblem: React.FC<BusanWaterEmblemProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="부산광역시 상수도사업본부 공식 엠블럼"
    >
      <defs>
        {/* 청정 에코 그린 그라디언트 (좌측 유선형 회전 곡선) */}
        <linearGradient id="bwa-green" x1="15%" y1="10%" x2="45%" y2="90%">
          <stop offset="0%" stopColor="#84CC16" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* 맑고 깊은 부산 상수도 딥블루 그라디언트 (우측 외곽 물방울 루프) */}
        <linearGradient id="bwa-blue" x1="85%" y1="10%" x2="30%" y2="95%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#005BAC" />
          <stop offset="100%" stopColor="#0F3875" />
        </linearGradient>

        {/* 중앙 순수 물방울 그라디언트 (순수 365 워터 코어) */}
        <linearGradient id="bwa-cyan" x1="30%" y1="20%" x2="70%" y2="90%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#00A0E9" />
          <stop offset="100%" stopColor="#005BAC" />
        </linearGradient>

        {/* 미세 하이라이트 광택 */}
        <linearGradient id="bwa-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. 좌측 및 하단 감싸는 친환경 녹색 물줄기 곡선 (Clean Earth & Water) */}
      <path
        d="M 46 15 
           C 24 20, 10 38, 11 59
           C 12 76, 26 90, 48 90
           C 58 90, 68 86, 75 80
           C 65 85, 52 86, 42 83
           C 25 78, 18 63, 20 48
           C 22 33, 33 22, 46 15 Z"
        fill="url(#bwa-green)"
      />

      {/* 2. 우측 물방울 형태의 딥블루 루프 (Pure Busan Water Body) */}
      <path
        d="M 50 8
           C 54 8, 62 17, 72 29
           C 84 43, 90 56, 88 70
           C 85 84, 71 93, 55 93
           C 69 91, 79 81, 81 68
           C 83 55, 76 43, 67 31
           C 59 20, 52 13, 50 8 Z"
        fill="url(#bwa-blue)"
      />

      {/* 3. 중앙에 안착된 순수하고 깨끗한 물방울 코어 (순수 365) */}
      <path
        d="M 50 22
           C 50 22, 68 45, 68 60
           C 68 70, 60 78, 50 78
           C 40 78, 32 70, 32 60
           C 32 45, 50 22, 50 22 Z"
        fill="url(#bwa-cyan)"
      />

      {/* 4. 물방울 상단 반사광 하이라이트 */}
      <path
        d="M 49 28
           C 49 28, 42 42, 40 52
           C 38 43, 44 32, 49 28 Z"
        fill="url(#bwa-highlight)"
      />

      {/* 5. 내부 작은 반짝임 코어 포인트 */}
      <ellipse cx="44" cy="55" rx="3.5" ry="5.5" transform="rotate(-25 44 55)" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
};
