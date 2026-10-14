import { OrderModel } from "@/server/db/models/order.model";
import { withDb } from "@/server/db/with-db";
import type { OrderStatus } from "@/types/order";
import type {
  DailyRevenueStat,
  HourlyOrderStat,
  ReportRange,
  ReportSummary,
  StatusCount,
  TopMenuItemStat,
} from "@/types/report";

function startDateForRange(range: ReportRange): Date | null {
  const now = new Date();
  if (range === "all") {
    return null;
  }
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = range === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getReportSummary(
  range: ReportRange,
): Promise<ReportSummary> {
  return withDb(async () => {
    const from = startDateForRange(range);
    const createdAtFilter = from ? { createdAt: { $gte: from } } : {};

    const [orders, statusAgg, topItemsAgg, dailyAgg, activeOrders] =
      await Promise.all([
        OrderModel.find(createdAtFilter).lean(),
        OrderModel.aggregate<{ _id: OrderStatus; count: number }>([
          { $match: createdAtFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        OrderModel.aggregate<{
          _id: string;
          quantitySold: number;
          revenue: number;
        }>([
          {
            $match: {
              ...createdAtFilter,
              status: "paid",
            },
          },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.name",
              quantitySold: { $sum: "$items.quantity" },
              revenue: {
                $sum: {
                  $multiply: ["$items.price", "$items.quantity"],
                },
              },
            },
          },
          { $sort: { quantitySold: -1 } },
          { $limit: 8 },
        ]),
        OrderModel.aggregate<{
          _id: string;
          revenue: number;
          orderCount: number;
        }>([
          {
            $match: {
              ...createdAtFilter,
              status: "paid",
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              revenue: { $sum: "$subtotal" },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        OrderModel.countDocuments({
          status: { $nin: ["paid", "cancelled"] },
        }),
      ]);

    const paidOrders = orders.filter((o) => o.status === "paid");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");
    const paidRevenue = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const averagePaidTicket =
      paidOrders.length > 0 ? paidRevenue / paidOrders.length : 0;

    const statusBreakdown: StatusCount[] = statusAgg.map((row) => ({
      status: row._id,
      count: row.count,
    }));

    const topItems: TopMenuItemStat[] = topItemsAgg.map((row) => ({
      name: row._id,
      quantitySold: row.quantitySold,
      revenue: row.revenue,
    }));

    const dailyRevenue: DailyRevenueStat[] = dailyAgg.map((row) => ({
      date: row._id,
      revenue: row.revenue,
      orderCount: row.orderCount,
    }));

    if (range === "7d" || range === "today") {
      fillDailyGaps(dailyRevenue, range === "today" ? 1 : 7);
    }

    return {
      range,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      cancelledOrders: cancelledOrders.length,
      activeOrders,
      paidRevenue,
      averagePaidTicket,
      statusBreakdown,
      topItems,
      dailyRevenue,
    };
  });
}

/** Orders created today, grouped by hour (server local timezone). */
export async function getTodayHourlyStats(): Promise<HourlyOrderStat[]> {
  return withDb(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const rows = await OrderModel.aggregate<{
      _id: number;
      orderCount: number;
      completedRevenue: number;
    }>([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orderCount: { $sum: 1 },
          completedRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$subtotal", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byHour = new Map(rows.map((r) => [r._id, r]));
    const stats: HourlyOrderStat[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const row = byHour.get(hour);
      stats.push({
        hour,
        orderCount: row?.orderCount ?? 0,
        completedRevenue: row?.completedRevenue ?? 0,
      });
    }
    return stats;
  });
}

function fillDailyGaps(stats: DailyRevenueStat[], dayCount: number) {
  const map = new Map(stats.map((s) => [s.date, s]));
  const today = new Date();
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    if (!map.has(key)) {
      stats.push({ date: key, revenue: 0, orderCount: 0 });
    }
  }
  stats.sort((a, b) => a.date.localeCompare(b.date));
}
