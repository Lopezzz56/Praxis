"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QueueToken } from "@/components/shared/QueueToken";
import { MetricCard } from "@/components/shared/MetricCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { Appointment, PaymentStatus } from "@/lib/types";
import { formatCurrency, formatTime, getTodayDateString } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  Phone,
  Stethoscope,
  XCircle,
  ListOrdered,
  CalendarCheck,
} from "lucide-react";

export default function ReceptionDeskPage() {
  const {
    todayAppointments,
    metrics,
    doctorProfile,
    addWalkIn,
    checkInPatient,
    callPatient,
    completeConsultation,
    cancelAppointment,
    markNoShow,
    updatePaymentStatus,
  } = useClinicStore();

  const { toast } = useToast();
  const today = getTodayDateString();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "waiting" | "booked" | "completed">("all");

  // Walk-in modal
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInData, setWalkInData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "Male" as "Male" | "Female" | "Other",
    patientPhone: "",
    chiefComplaint: "",
    paymentStatus: "paid" as PaymentStatus,
  });
  const [walkInErrors, setWalkInErrors] = useState<Record<string, string>>({});

  // Filtered list
  const filteredAppointments = todayAppointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "waiting") {
      return apt.status === "waiting" || apt.status === "checked_in" || apt.status === "in_consultation";
    }
    if (filterTab === "booked") {
      return apt.status === "booked";
    }
    if (filterTab === "completed") {
      return apt.status === "completed";
    }
    return true;
  });

  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!walkInData.patientName.trim()) errors.patientName = "Patient name is required";
    const age = parseInt(walkInData.patientAge, 10);
    if (!walkInData.patientAge || isNaN(age) || age < 1) errors.patientAge = "Valid age is required";
    if (!walkInData.patientPhone.trim() || walkInData.patientPhone.length < 10) errors.patientPhone = "10-digit phone is required";
    if (!walkInData.chiefComplaint.trim()) errors.chiefComplaint = "Reason for visit is required";

    if (Object.keys(errors).length > 0) {
      setWalkInErrors(errors);
      return;
    }

    const newApt = addWalkIn({
      patientName: walkInData.patientName.trim(),
      patientAge: parseInt(walkInData.patientAge, 10),
      patientGender: walkInData.patientGender,
      patientPhone: walkInData.patientPhone.trim(),
      chiefComplaint: walkInData.chiefComplaint.trim(),
      paymentStatus: walkInData.paymentStatus,
    });

    setWalkInModalOpen(false);
    setWalkInData({
      patientName: "",
      patientAge: "",
      patientGender: "Male",
      patientPhone: "",
      chiefComplaint: "",
      paymentStatus: "paid",
    });
    setWalkInErrors({});

    toast({
      title: "Walk-in Added to Queue",
      description: `Token ${newApt.tokenNumber} issued to ${newApt.patientName}. Placed in live queue.`,
      type: "success",
    });
  };

  const handleCheckIn = (apt: Appointment) => {
    checkInPatient(apt.id);
    toast({
      title: "Patient Checked In",
      description: `${apt.patientName} has arrived and is assigned to the waiting lounge.`,
      type: "success",
    });
  };

  const handleTogglePayment = (apt: Appointment) => {
    const nextStatus: PaymentStatus = apt.paymentStatus === "paid" ? "pending" : "paid";
    updatePaymentStatus(apt.id, nextStatus);
    toast({
      title: "Payment Updated",
      description: `Fee of ${formatCurrency(apt.fee)} marked as ${nextStatus.toUpperCase()} for ${apt.patientName}.`,
      type: "info",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-clinic-700">
            Reception & Clerk Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Waiting Lounge & Queue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track waiting patients, issue walk-in tokens, manage check-ins, and record payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reception/appointments">
            <Button variant="outline" size="sm" className="gap-2">
              <ListOrdered className="w-4 h-4" />
              <span>Full Master Registry</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setWalkInModalOpen(true)}
            className="gap-2 bg-clinic-600 hover:bg-clinic-700 font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Walk-In Patient</span>
          </Button>
        </div>
      </div>

      {/* Operational Reception Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Waiting in Lounge"
          value={metrics.waitingCount}
          subtitle="Currently seated in clinic"
          icon={<Users className="w-5 h-5 text-amber-600" />}
          highlight={metrics.waitingCount > 0 ? "amber" : "default"}
        />
        <MetricCard
          title="Inside with Doctor"
          value={metrics.inConsultationCount}
          subtitle="Consultation in progress"
          icon={<Stethoscope className="w-5 h-5 text-purple-600" />}
          highlight={metrics.inConsultationCount > 0 ? "teal" : "default"}
        />
        <MetricCard
          title="Completed Today"
          value={metrics.completedCount}
          subtitle="Discharged visits"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          highlight="emerald"
        />
        <MetricCard
          title="Pending Fees"
          value={formatCurrency(metrics.pendingIncome)}
          subtitle="Collect at checkout"
          icon={<DollarSign className="w-5 h-5 text-rose-600" />}
        />
      </div>

      {/* Search and Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, phone, or token (e.g. A-02)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-clinic-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto">
          {[
            { id: "all", label: `All Today (${todayAppointments.length})` },
            { id: "waiting", label: `In Clinic (${metrics.waitingCount + metrics.inConsultationCount})` },
            { id: "booked", label: `Booked Expected (${todayAppointments.filter((a) => a.status === "booked").length})` },
            { id: "completed", label: `Completed (${metrics.completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Today's Live Queue & Patient Registry Table */}
      <Card className="border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Today's Patient Roster & Live Queue</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredAppointments.length} matching appointments for {today}
            </CardDescription>
          </div>
          <span className="text-xs text-slate-500">
            Fee Standard: {formatCurrency(doctorProfile.consultationFee)}
          </span>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Token / Pos</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Scheduled Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => {
                  const isWaitingOrInRoom =
                    apt.status === "waiting" || apt.status === "checked_in" || apt.status === "in_consultation";

                  return (
                    <tr
                      key={apt.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        apt.status === "in_consultation" ? "bg-purple-50/30" : ""
                      }`}
                    >
                      {/* Token */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {apt.tokenNumber ? (
                          <div className="flex items-center gap-2">
                            <QueueToken
                              tokenNumber={apt.tokenNumber}
                              size="sm"
                              isActive={apt.status === "in_consultation"}
                            />
                            {apt.queuePosition ? (
                              <span className="text-[10px] font-mono text-slate-400">
                                #{apt.queuePosition}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">Unassigned</span>
                        )}
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{apt.patientAge}y, {apt.patientGender}</span>
                          <span>•</span>
                          <span className="font-mono">{apt.patientPhone}</span>
                          {apt.isWalkIn && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              Walk-in
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                          "{apt.chiefComplaint}"
                        </p>
                      </td>

                      {/* Scheduled slot */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <span className="font-mono font-medium text-slate-700">
                          {formatTime(apt.time)}
                        </span>
                        {apt.checkedInAt && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Arrived {apt.checkedInAt}
                          </span>
                        )}
                      </td>

                      {/* Canonical Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={apt.status} role="reception" />
                      </td>

                      {/* Payment Status Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePayment(apt)}
                          title="Click to toggle payment collected"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            apt.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          <span>{formatCurrency(apt.fee)}</span>
                          <span className="uppercase text-[10px] font-bold">
                            ({apt.paymentStatus})
                          </span>
                        </button>
                      </td>

                      {/* Reception Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === "booked" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleCheckIn(apt)}
                              className="h-8 text-xs font-semibold px-3"
                            >
                              Check In & Token
                            </Button>
                          )}

                          {apt.status === "waiting" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                callPatient(apt.id);
                                toast({
                                  title: "Patient Called",
                                  description: `${apt.patientName} called to doctor consultation room.`,
                                  type: "success",
                                });
                              }}
                              className="h-8 text-xs px-2.5 text-clinic-700 border-clinic-300 hover:bg-clinic-50"
                            >
                              Call to Doctor
                            </Button>
                          )}

                          {apt.status === "in_consultation" && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => {
                                completeConsultation(apt.id);
                                toast({
                                  title: "Consultation Complete",
                                  description: `Visit marked complete for ${apt.patientName}.`,
                                  type: "success",
                                });
                              }}
                              className="h-8 text-xs px-2.5"
                            >
                              Mark Done
                            </Button>
                          )}

                          {apt.status !== "completed" && apt.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                cancelAppointment(apt.id, "Cancelled by Reception Desk");
                                toast({
                                  title: "Appointment Cancelled",
                                  description: `Cancelled slot for ${apt.patientName}.`,
                                  type: "warning",
                                });
                              }}
                              className="text-xs text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Cancel appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No appointments found matching current search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Walk-In Patient Modal */}
      <Dialog
        isOpen={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        title="Add Walk-In Patient"
        description="Issue an immediate token and place the patient in Dr. Vance's active waiting queue."
      >
        <form onSubmit={handleAddWalkIn} className="space-y-4">
          <Input
            label="Patient Full Name"
            required
            placeholder="e.g. Rekha Sharma"
            value={walkInData.patientName}
            onChange={(e) => setWalkInData({ ...walkInData, patientName: e.target.value })}
            error={walkInErrors.patientName}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age"
              type="number"
              required
              placeholder="e.g. 45"
              value={walkInData.patientAge}
              onChange={(e) => setWalkInData({ ...walkInData, patientAge: e.target.value })}
              error={walkInErrors.patientAge}
            />

            <Select
              label="Gender"
              required
              value={walkInData.patientGender}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
              onChange={(e) => setWalkInData({ ...walkInData, patientGender: e.target.value as any })}
            />
          </div>

          <Input
            label="Contact Mobile"
            type="tel"
            required
            placeholder="10-digit mobile number"
            value={walkInData.patientPhone}
            onChange={(e) => setWalkInData({ ...walkInData, patientPhone: e.target.value })}
            error={walkInErrors.patientPhone}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Chief Clinical Concern <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. High fever, stomach ache, blood pressure check..."
              value={walkInData.chiefComplaint}
              onChange={(e) => setWalkInData({ ...walkInData, chiefComplaint: e.target.value })}
              className={`w-full p-3 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 ${
                walkInErrors.chiefComplaint ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {walkInErrors.chiefComplaint && (
              <p className="text-xs text-rose-600 mt-1 font-medium">• {walkInErrors.chiefComplaint}</p>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Consultation Fee</span>
              <span className="text-xs text-slate-500">Collect {formatCurrency(doctorProfile.consultationFee)}</span>
            </div>
            <select
              value={walkInData.paymentStatus}
              onChange={(e) => setWalkInData({ ...walkInData, paymentStatus: e.target.value as any })}
              className="text-xs font-semibold p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="paid">Mark Paid Now</option>
              <option value="pending">Mark Pending at Checkout</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setWalkInModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="bg-clinic-600 hover:bg-clinic-700 font-bold">
              Issue Token & Enqueue Patient
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
