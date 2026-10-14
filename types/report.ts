import type { OrderStatus } from "@/types/order";

export const REPORT_RANGES = ["today", "7d", "30d", "all"] as const;

export type ReportRange = (typeof REPORT_RANGES)[number];

export type StatusCount = {
  status: OrderStatus;
  count: number;
};

export type TopMenuItemStat = {
  name: string;
  quantitySold: number;
  revenue: number;
};

export type DailyRevenueStat = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type HourlyOrderStat = {
  hour: number;
  orderCount: number;
  completedRevenue: number;
};

export type ReportSummary = {
  range: ReportRange;
  totalOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  activeOrders: number;
  paidRevenue: number;
  averagePaidTicket: number;
  statusBreakdown: StatusCount[];
  topItems: TopMenuItemStat[];
  dailyRevenue: DailyRevenueStat[];
};
