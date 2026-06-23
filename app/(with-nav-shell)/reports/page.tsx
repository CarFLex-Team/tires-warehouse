"use client";

import SectionHeader from "@/components/ui/ChartsHeader";
import CurrencyTooltip from "@/components/ui/CurrencyToolTip";
import KpiCard from "@/components/ui/KpiCard";
import {
  getMonthlySales,
  getMonthlySalesByCategory,
  getTopTires,
  MonthDataCategory,
  MonthlySales,
  TopTire,
} from "@/lib/api/reports";
import { fmt, fmtK, pctChange } from "@/lib/currenyFunctions";
import { exportToExcel } from "@/lib/exportToExcel";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRef } from "react";
interface MonthData {
  month: string;
  totalTax: number;

  sales: number;
  expenses: number;
  newTires: number;
  newTiresAmount: number;
  usedTires: number;
  usedTiresAmount: number;
  services: number;
  servicesAmount: number;
}

const COLORS = {
  blue: "#3f5967",
  orange: "#ea580c",
  green: "#16a34a",
  slate: "#6e97af",
};

const PIE_COLORS = [COLORS.blue, COLORS.slate, COLORS.green, COLORS.orange];
const MONTHS = [
  "All",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function ReportsPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const {
    data: monthlySales,
    isLoading: isMonthlySalesLoading,
    error: monthlySalesError,
  } = useQuery<MonthlySales[]>({
    queryKey: ["monthly-sales", selectedYear],
    queryFn: () => getMonthlySales(parseInt(selectedYear)),
  });
  const {
    data: monthlySalesPerCategory,
    isLoading: isMonthlySalesPerCategoryLoading,
    error: monthlySalesPerCategoryError,
  } = useQuery<MonthDataCategory[]>({
    queryKey: ["monthly-sales-by-category", selectedYear],
    queryFn: () => getMonthlySalesByCategory(parseInt(selectedYear)),
  });
  const {
    data: topTires,
    isLoading: isTopTiresLoading,
    error: topTiresError,
  } = useQuery<TopTire[]>({
    queryKey: ["top-tires", selectedYear],
    queryFn: () => getTopTires(parseInt(selectedYear)),
  });

  const MONTHLY_DATA: MonthData[] = useMemo(() => {
    if (!monthlySales || !monthlySalesPerCategory) return [];
    return monthlySales.map((m) => {
      const categoryData = monthlySalesPerCategory.find(
        (c) => c.month === m.month,
      );
      return {
        month: new Date(Number(selectedYear), m.month - 1).toLocaleString(
          "en-US",
          {
            month: "short",
          },
        ),
        sales: Number(m.total_amount || 0),
        expenses: Number(categoryData?.expenses || 0),
        newTires: Number(categoryData?.newTiresQuantity || 0),
        usedTires: Number(categoryData?.usedTiresQuantity || 0),
        services: Number(categoryData?.servicesQuantity || 0),
        newTiresAmount: Number(categoryData?.newTiresAmount || 0),
        usedTiresAmount: Number(categoryData?.usedTiresAmount || 0),
        servicesAmount: Number(categoryData?.servicesAmount || 0),

        totalTax: Number(m.total_tax || 0),
      };
    });
  }, [monthlySales, monthlySalesPerCategory, selectedYear]);
  const visibleData = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    return MONTHLY_DATA.filter((d, index) => {
      const monthNumber = index + 1;

      // If viewing current year, hide future months
      if (Number(selectedYear) === currentYear && monthNumber > currentMonth) {
        return false;
      }

      return true;
    });
  }, [MONTHLY_DATA, selectedYear]);

  const filteredData = useMemo(() => {
    if (selectedMonth === "All") return visibleData;
    return visibleData.filter((d) => d.month === selectedMonth);
  }, [selectedMonth, visibleData]);
  const filteredTopTires = useMemo(() => {
    if (selectedMonth === "All")
      return (topTires || []).sort((a, b) => b.units - a.units).slice(0, 5);
    const monthIndex = MONTHS.indexOf(selectedMonth);
    return (topTires || []).filter((t) => t.month === monthIndex);
  }, [selectedMonth, topTires]);

  const totals = useMemo(() => {
    const sales = filteredData.reduce((s, d) => s + d.sales, 0);
    const expenses = filteredData.reduce((s, d) => s + d.expenses, 0);

    const tires =
      filteredData.reduce((s, d) => s + d.newTires, 0) +
      filteredData.reduce((s, d) => s + d.usedTires, 0);
    const services = filteredData.reduce((s, d) => s + d.services, 0);
    return { sales, expenses, tires, services };
  }, [filteredData]);

  const momData = visibleData.map((d, i) => {
    const prev = i === 0 ? null : visibleData[i - 1].sales;
    const pct = prev
      ? parseFloat((((d.sales - prev) / prev) * 100).toFixed(1))
      : 0;
    return { month: d.month, sales: d.sales, growth: pct };
  });

  const newRev = filteredData.reduce((s, d) => s + d.newTiresAmount, 0);
  const usedRev = filteredData.reduce((s, d) => s + d.usedTiresAmount, 0);
  const taxRev = filteredData.reduce((s, d) => s + d.totalTax, 0);
  const serviceRev = filteredData.reduce((s, d) => s + d.servicesAmount, 0);
  const pieData = [
    { name: "New tires", value: newRev },
    { name: "Used tires", value: usedRev },
    { name: "Services", value: serviceRev },
    { name: "Tax", value: taxRev },
  ];
  const comparisonTotals = useMemo(() => {
    if (!MONTHLY_DATA.length) return null;
    if (selectedMonth !== "All") {
      const monthIndex = MONTHS.indexOf(selectedMonth) - 1;

      const current = MONTHLY_DATA[monthIndex];
      const previous = monthIndex === 0 ? null : MONTHLY_DATA[monthIndex - 1];

      return {
        sales: {
          current: current?.sales ?? 0,
          previous: previous?.sales ?? 0,
        },
        expenses: {
          current: current?.expenses ?? 0,
          previous: previous?.expenses ?? 0,
        },
        tires: {
          current: current?.newTires ?? 0,
          previous: previous?.newTires ?? 0,
        },
        services: {
          current: current?.services ?? 0,
          previous: previous?.services ?? 0,
        },
      };
    }
  }, [selectedMonth, MONTHLY_DATA]);
  const maxUnits = useMemo(() => {
    if (!filteredTopTires) return 0;
    return Math.max(...filteredTopTires.map((t) => t.units));
  }, [filteredTopTires]);

  //   // Export handler — wire to your real API
  //   const handleExport = () => {
  //     const params = new URLSearchParams({
  //       year: selectedYear,
  //       month: selectedMonth,
  //     });
  //     alert(
  //       `Export triggered: /api/reports/export?${params.toString()}\n(Wire this to your real endpoint)`,
  //     );
  //   };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" ref={reportRef}>
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Analytics & Reports
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {["2026", "2027", "2028"].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m === "All" ? "All months" : m}
              </option>
            ))}
          </select>
          {/* Export */}
          <button
            onClick={() =>
              exportToExcel(
                filteredData,
                filteredTopTires,
                totals,
                selectedYear,
                selectedMonth,
              )
            }
            className="flex items-center gap-2 text-sm bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all text-white px-4 py-1.5 rounded-lg font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Sales"
            value={fmt(totals.sales)}
            delta={pctChange(
              comparisonTotals?.sales?.current ?? 0,
              comparisonTotals?.sales?.previous ?? 0,
            )}
            deltaPositive={
              (comparisonTotals?.sales?.current ?? 0) >=
              (comparisonTotals?.sales?.previous ?? 0)
            }
            icon=""
            accentClass=""
          />
          <KpiCard
            label="Total Expenses"
            value={fmt(totals.expenses)}
            delta={pctChange(
              comparisonTotals?.expenses?.current ?? 0,
              comparisonTotals?.expenses?.previous ?? 0,
            )}
            deltaPositive={
              (comparisonTotals?.expenses?.current ?? 0) >=
              (comparisonTotals?.expenses?.previous ?? 0)
            }
            icon=""
            accentClass=""
          />
          <KpiCard
            label="Tires Sold"
            value={`${totals.tires} units`}
            delta={pctChange(
              comparisonTotals?.tires?.current ?? 0,
              comparisonTotals?.tires?.previous ?? 0,
            )}
            deltaPositive={
              (comparisonTotals?.tires?.current ?? 0) >=
              (comparisonTotals?.tires?.previous ?? 0)
            }
            icon=""
            accentClass=""
          />
          <KpiCard
            label="Services Done"
            value={`${totals.services} services`}
            delta={pctChange(
              comparisonTotals?.services?.current ?? 0,
              comparisonTotals?.services?.previous ?? 0,
            )}
            deltaPositive={
              (comparisonTotals?.services?.current ?? 0) >=
              (comparisonTotals?.services?.previous ?? 0)
            }
            icon=""
            accentClass=""
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sales vs Expenses */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <SectionHeader
              title="Sales vs Expenses"
              subtitle="Monthly sales and expense breakdown"
            />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filteredData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtK}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) => (
                    <span className="text-slate-500">{value}</span>
                  )}
                />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill={COLORS.blue}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill={COLORS.orange}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tires Sold */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <SectionHeader
              title="Tires Sold — New vs Used"
              subtitle="Monthly units by condition"
            />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={filteredData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) => (
                    <span className="text-slate-500">{value}</span>
                  )}
                />
                <Bar
                  dataKey="newTires"
                  name="New"
                  stackId="tires"
                  fill={COLORS.blue}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="usedTires"
                  name="Used"
                  stackId="tires"
                  fill={COLORS.slate}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Month-over-Month Line Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 lg:col-span-2">
            <SectionHeader
              title="Month-over-Month Sales"
              subtitle="Full-year sales trend and growth %"
            />
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={momData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="rev"
                  tickFormatter={fmtK}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <YAxis
                  yAxisId="pct"
                  orientation="right"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) => (
                    <span className="text-slate-500">{value}</span>
                  )}
                />
                <Line
                  yAxisId="rev"
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke={COLORS.blue}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.blue, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="growth"
                  name="Growth %"
                  stroke={COLORS.green}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: COLORS.green, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sales Split Donut */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <SectionHeader
              title="Sales Split"
              subtitle="New vs used tires, services, and tax"
            />
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [fmt(Number(val ?? 0)), ""]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom legend */}
            <div className="mt-4 space-y-2">
              {pieData.map((d, i) => {
                const pct =
                  Math.round((d.value / (newRev + usedRev)) * 100) || 0;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-500">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: PIE_COLORS[i] }}
                      />
                      {d.name}
                    </span>
                    <span className="font-medium text-slate-700">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Top Sold Tires ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionHeader
            title="Top Sold Tires"
            subtitle="Ranked by units sold"
          />
          <div className="space-y-3">
            {filteredTopTires?.map((tire, i) => {
              const barW = Math.round((tire.units / maxUnits) * 100);
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-slate-300 w-4 shrink-0 font-medium">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-700 truncate pr-4">
                        {tire.name}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            tire.condition === "NEW"
                              ? "bg-blue-50 text-blue-600"
                              : tire.condition === "USED"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {tire.condition}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 w-10 text-right">
                          {tire.units}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barW}%`,
                          background:
                            tire.condition === "NEW"
                              ? COLORS.blue
                              : tire.condition === "USED"
                                ? COLORS.slate
                                : COLORS.orange,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
