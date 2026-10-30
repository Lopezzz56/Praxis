"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { MetricCard } from "@/components/shared/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, getTodayDateString } from "@/lib/utils";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Download,
  ShieldCheck,
} from "lucide-react";

export default function DoctorInsightsPage() {
  const { appointments, todayAppointments, metrics, doctorProfile } = useClinicStore();
  const today = getTodayDateString();

  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  // Monthly aggregated mock data for Dr. Vance's solo practice
  const monthlyData = [
    { week: "Week 1 (Oct 1 - Oct 7)", patients: 68, completed: 64, noShows: 3, income: 51200 },
    { week: "Week 2 (Oct 8 - Oct 14)", patients: 74, completed: 71, noShows: 2, income: 56800 },
    { week: "Week 3 (Oct 15 - Oct 21)", patients: 82, completed: 79, noShows: 2, income: 63200 },
    { week: "Week 4 (Oct 22 - Oct 29)", patients: 79, completed: 75, noShows: 3, income: 60000 },
  ];

  const totalMonthlyIncome = monthlyData.reduce((acc, w) => acc + w.income, 0) + metrics.totalIncome;
  const totalMonthlyPatients = monthlyData.reduce((acc, w) => acc + w.completed, 0) + metrics.completedCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <Link
            href="/doctor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Doctor Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinic Practice Performance & Income
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Clear visibility into daily earnings, patient attendance rates, and monthly practice growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Report</span>
          </Button>

          {/* Tab Selector */}
          <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "daily" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              End-of-Day
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              Monthly Analysis
            </button>
          </div>
        </div>
      </div>

      {activeTab === "daily" ? (
        /* ================= DAILY END-OF-DAY SUMMARY ================= */
        <div className="space-y-6">
          {/* Clinic Owner Principle: How many patients came & how much income was generated? */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Today's Realized Income"
              value={formatCurrency(metrics.totalIncome)}
              subtitle="Received via Cash / UPI at clinic"
              icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
              highlight="emerald"
            />
            <MetricCard
              title="Pending Receivables"
              value={formatCurrency(metrics.pendingIncome)}
              subtitle="Pending checkout at reception"
              icon={<DollarSign className="w-5 h-5 text-amber-600" />}
              highlight={metrics.pendingIncome > 0 ? "amber" : "default"}
            />
            <MetricCard
              title="Completed Consultations"
              value={metrics.completedCount}
              subtitle={`Out of ${metrics.totalAppointments} booked`}
              icon={<Users className="w-5 h-5 text-clinic-600" />}
              highlight="teal"
            />
            <MetricCard
              title="No-Show / Cancelled"
              value={`${metrics.noShowCount} / ${metrics.cancelledCount}`}
              subtitle="Slots released or missed"
              icon={<XCircle className="w-5 h-5 text-rose-600" />}
            />
          </div>

          {/* Financial Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base">Financial Reconciliation for {formatDate(today)}</CardTitle>
                <span className="text-xs text-slate-400">Consultation Standard: ₹800 per patient</span>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Consultations Provided Today</span>
                  <span className="font-bold text-slate-900">{metrics.completedCount} visits</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Standard Practice Fee Rate</span>
                  <span className="font-bold text-slate-900">{formatCurrency(doctorProfile.consultationFee)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Fee Billed Today</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(metrics.totalIncome + metrics.pendingIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-emerald-700">
                  <span className="font-semibold">Cash & Digital Collections Received</span>
                  <span className="font-extrabold">{formatCurrency(metrics.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-amber-700">
                  <span className="font-semibold">Uncollected / Pending Balance</span>
                  <span className="font-extrabold">{formatCurrency(metrics.pendingIncome)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Productivity */}
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base">Clinical Operations & Quality</CardTitle>
                <span className="text-xs text-slate-400">Practice benchmark indicators</span>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Average Consultation Duration</span>
                  <span className="font-bold text-slate-900">14 minutes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Average Waiting Room Wait Time</span>
                  <span className="font-bold text-slate-900">11 minutes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Patient Attendance Rate</span>
                  <span className="font-bold text-emerald-700">
                    {metrics.totalAppointments > 0
                      ? `${Math.round(((metrics.completedCount + metrics.inConsultationCount) / metrics.totalAppointments) * 100)}%`
                      : "100%"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Doctor Prescriptions Authored</span>
                  <span className="font-bold text-slate-900">{metrics.completedCount} recorded</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ================= MONTHLY ANALYSIS ================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total Monthly Revenue"
              value={formatCurrency(totalMonthlyIncome)}
              subtitle="Current 30-day billing total"
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              highlight="emerald"
            />
            <MetricCard
              title="Total Patients Served"
              value={totalMonthlyPatients}
              subtitle="Unique consultations completed"
              icon={<Users className="w-5 h-5 text-clinic-600" />}
              highlight="teal"
            />
            <MetricCard
              title="Monthly No-Show Rate"
              value="3.2%"
              subtitle="Well within safe practice limits (<5%)"
              icon={<ShieldCheck className="w-5 h-5 text-slate-500" />}
            />
          </div>

          <Card className="border-slate-200/90 shadow-sm overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-base">Weekly Practice Performance Breakdown</CardTitle>
              <span className="text-xs text-slate-400">Current calendar month volume</span>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Booked Patients</th>
                    <th className="py-3 px-4">Completed Consultations</th>
                    <th className="py-3 px-4">No-Shows</th>
                    <th className="py-3 px-4 text-right">Practice Gross Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.week}</td>
                      <td className="py-3.5 px-4 text-slate-700">{row.patients}</td>
                      <td className="py-3.5 px-4 font-medium text-emerald-700">{row.completed}</td>
                      <td className="py-3.5 px-4 text-rose-600">{row.noShows}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(row.income)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td className="py-3.5 px-4 text-slate-900">Month Total</td>
                    <td className="py-3.5 px-4">303</td>
                    <td className="py-3.5 px-4 text-emerald-700">{totalMonthlyPatients}</td>
                    <td className="py-3.5 px-4 text-rose-600">10</td>
                    <td className="py-3.5 px-4 text-right text-emerald-800 text-base">
                      {formatCurrency(totalMonthlyIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

