export interface OrdinanceBasis {
  title: string;
  relevantOrdinance: string;
  rateStructure: string;
  reductionCriteria: string;
}

export interface OutageInfo {
  dateTime: string;
  targetArea: string;
  reason: string;
  restorationTime: string;
  emergencyWater: string;
}

export interface RealtimeOutageItem {
  id: string;
  district: string;
  areaDetail: string;
  workType: string;
  startTime: string;
  endTime: string;
  status: "ongoing" | "scheduled" | "resolved";
  affectedHouseholds?: string;
  reason: string;
  emergencyWaterSupport: string;
  branchOfficeName: string;
  contactNumber: string;
}

export interface RealtimeOutageData {
  isConnected: boolean;
  provider: string;
  syncTime: string;
  items: RealtimeOutageItem[];
  totalCount: number;
  noticeMessage?: string;
}

export interface ConsultationResponse {
  ordinanceBasis: OrdinanceBasis;
  callScript: string;
  smsMessage: string;
  outageInfo: OutageInfo | null;
}

export interface BranchOffice {
  id: string;
  name: string;
  districts: string[];
  phone: string;
  fax: string;
  address: string;
}

export interface QuickPreset {
  id: string;
  category: string;
  title: string;
  shortDesc: string;
  query: string;
  isOutage: boolean;
  data: ConsultationResponse;
}
