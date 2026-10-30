"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QueueToken } from "@/components/shared/QueueToken";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AppointmentStatus, PaymentStatus } from "@/lib/types";
import { formatCurrency, formatDate, formatTime, getTodayDateString } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Download,
} from "lucide-react";

export default function ReceptionMasterAppointmentsPage() {
  const {
    appointments,
    doctorProfile,
    checkInPatient,
    cancelAppointment,
    updatePaymentStatus,
  } = useClinicStore();

  const { toast } = useToast();
  const today = getTodayDateString();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      apt.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== "all" && apt.status !== statusFilter) {
      return false;
    }

    if (dateFilter === "today" && apt.date !== today) {
      return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = "ID,Token,Patient,Age,Gender,Phone,Date,Time,Type,Status,Payment,Fee,Complaint\n";
    const rows = filtered
      .map(
        (a) =>
          `"${a.id}","${a.tokenNumber || ""}","${a.patientName}",${a.patientAge},"${a.patientGender}","${a.patientPhone}","${a.date}","${a.time}","${a.type}","${a.status}","${a.paymentStatus}",${a.fee},"${a.chiefComplaint.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clinic_appointments_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Data Exported",
      description: `Downloaded ${filtered.length} appointment records as CSV.`,
      type: "info",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <Link
            href="/reception"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Waiting Lounge</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Appointment Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete multi-date appointment ledger, status audits, and patient billing records.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 self-start sm:self-auto">
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient, phone, symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-clinic-500"
            />
          </div>

          <Select
            value={statusFilter}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Booked (Confirmed)", value: "booked" },
              { label: "Checked In", value: "checked_in" },
              { label: "Waiting", value: "waiting" },
              { label: "In Consultation", value: "in_consultation" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
              { label: "No-Show", value: "no_show" },
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs"
          />

          <Select
            value={dateFilter}
            options={[
              { label: "All Dates", value: "all" },
              { label: `Today Only (${today})`, value: "today" },
            ]}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 text-xs"
          />
        </div>
      </Card>

      {/* Master Table */}
      <Card className="border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Ledger Entries ({filtered.length})</CardTitle>
          <span className="text-xs text-slate-400">Canonical status model enforced</span>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date / Slot</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{formatDate(apt.date)}</div>
                      <div className="text-xs font-mono text-slate-500">{formatTime(apt.time)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <div className="text-xs text-slate-500">
                        {apt.patientAge} yrs • {apt.patientGender} • {apt.patientPhone}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic line-clamp-1">
                        "{apt.chiefComplaint}"
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {apt.tokenNumber ? (
                        <QueueToken tokenNumber={apt.tokenNumber} size="sm" />
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={apt.status} role="reception" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          const nextStatus: PaymentStatus = apt.paymentStatus === "paid" ? "pending" : "paid";
                          updatePaymentStatus(apt.id, nextStatus);
                          toast({
                            title: "Payment Updated",
                            description: `Marked as ${nextStatus.toUpperCase()}`,
                            type: "info",
                          });
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                          apt.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {formatCurrency(apt.fee)} ({apt.paymentStatus})
                      </button>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {apt.status === "booked" && apt.date === today && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            checkInPatient(apt.id);
                            toast({
                              title: "Checked In",
                              description: `${apt.patientName} added to live queue.`,
                              type: "success",
                            });
                          }}
                          className="h-8 text-xs"
                        >
                          Check In
                        </Button>
                      )}
                      {apt.status !== "completed" && apt.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            cancelAppointment(apt.id, "Cancelled via master registry");
                            toast({
                              title: "Appointment Cancelled",
                              description: `${apt.patientName} slot released.`,
                              type: "warning",
                            });
                          }}
                          className="ml-2 text-xs text-slate-400 hover:text-rose-600 p-1"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                    No records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

