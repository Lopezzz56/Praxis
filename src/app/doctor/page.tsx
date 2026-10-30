"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QueueToken } from "@/components/shared/QueueToken";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Appointment } from "@/lib/types";
import { formatCurrency, formatTime, getTodayDateString } from "@/lib/utils";
import {
  Users,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  Stethoscope,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function DoctorDashboardPage() {
  const {
    todayAppointments,
    alerts,
    metrics,
    doctorProfile,
    callPatient,
    completeConsultation,
    markNoShow,
    dismissAlert,
  } = useClinicStore();

  const { toast } = useToast();
  const today = getTodayDateString();

  // Consultation notes dialog state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");

  // Patients in various states
  const inConsultationPatient = todayAppointments.find((a) => a.status === "in_consultation");
  const waitingPatients = todayAppointments
    .filter((a) => a.status === "waiting" || a.status === "checked_in")
    .sort((a, b) => (a.queuePosition || 99) - (b.queuePosition || 99));

  const nextPatient = waitingPatients[0] || null;

  const upcomingBookedPatients = todayAppointments.filter((a) => a.status === "booked");

  // Handlers
  const handleStartConsultation = (apt: Appointment) => {
    callPatient(apt.id);
    toast({
      title: "Consultation Started",
      description: `${apt.patientName} (Token ${apt.tokenNumber || "Next"}) is now in consultation room.`,
      type: "success",
    });
  };

  const handleOpenCompleteModal = (apt: Appointment) => {
    setActiveAppointment(apt);
    setClinicalNotes(apt.doctorNotes || "");
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = () => {
    if (!activeAppointment) return;
    completeConsultation(activeAppointment.id, clinicalNotes);
    setCompleteModalOpen(false);
    toast({
      title: "Consultation Completed",
      description: `Visit finalized for ${activeAppointment.patientName}. Queue has advanced.`,
      type: "success",
    });
  };

  const handleMarkNoShow = (apt: Appointment) => {
    markNoShow(apt.id);
    toast({
      title: "Patient Marked as No-Show",
      description: `${apt.patientName} was flagged as no-show. Next patient can now be called.`,
      type: "warning",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Doctor Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <span className="text-xs font-semibold text-clinic-700 uppercase tracking-wider">
            Doctor Operational Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Good day, {doctorProfile.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {doctorProfile.title} • {doctorProfile.clinicName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/doctor/insights">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4 text-clinic-600" />
              <span>End-of-Day & Insights</span>
            </Button>
          </Link>
          <Link href="/doctor/queue">
            <Button size="sm" className="gap-2 bg-clinic-600 hover:bg-clinic-700">
              <Stethoscope className="w-4 h-4" />
              <span>Dedicated Queue Room</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          PRIORITY 1: TODAY'S WORKLOAD
          ========================================================================= */}
      <section aria-labelledby="workload-heading">
        <h2 id="workload-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          1. Today's Clinical Workload
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <MetricCard
            title="Waiting in Queue"
            value={metrics.waitingCount}
            subtitle={metrics.waitingCount > 0 ? "Immediate attention required" : "Waiting room clear"}
            icon={<Users className="w-5 h-5 text-amber-600" />}
            highlight={metrics.waitingCount > 0 ? "amber" : "default"}
          />
          <MetricCard
            title="In Consultation"
            value={metrics.inConsultationCount}
            subtitle={inConsultationPatient ? inConsultationPatient.patientName : "Room currently open"}
            icon={<Stethoscope className="w-5 h-5 text-purple-600" />}
            highlight={inConsultationPatient ? "teal" : "default"}
          />
          <MetricCard
            title="Visits Completed"
            value={metrics.completedCount}
            subtitle={`Out of ${metrics.totalAppointments} expected today`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            highlight="emerald"
          />
          <MetricCard
            title="Upcoming Booked"
            value={upcomingBookedPatients.length}
            subtitle="Scheduled later today"
            icon={<Clock className="w-5 h-5 text-sky-600" />}
          />
          <MetricCard
            title="Avg Consultation"
            value={`${metrics.averageWaitTimeMinutes}m`}
            subtitle="Clinical pace on schedule"
            icon={<TrendingUp className="w-5 h-5 text-slate-500" />}
          />
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 2 & 3: CURRENT QUEUE & NEXT PATIENT (TOP OF FOLD)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Patient & In-Consultation Action Hub (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active in-consultation card (if any) */}
          {inConsultationPatient ? (
            <Card className="border-purple-300 bg-white ring-2 ring-purple-500/20 shadow-sm">
              <div className="bg-purple-50/80 p-4 border-b border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                    Active Consultation in Progress
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  Started at {inConsultationPatient.consultationStartedAt || "09:35"}
                </span>
              </div>

              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <QueueToken tokenNumber={inConsultationPatient.tokenNumber} size="md" isActive />
                      <h3 className="text-xl font-bold text-slate-900">
                        {inConsultationPatient.patientName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        ({inConsultationPatient.patientAge}y, {inConsultationPatient.patientGender})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Phone: {inConsultationPatient.patientPhone} • Visit: <strong>{inConsultationPatient.type}</strong>
                    </p>
                  </div>
                  <StatusBadge status="in_consultation" role="doctor" />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-1">Chief Health Complaint:</strong>
                  {inConsultationPatient.chiefComplaint}
                </div>

                {inConsultationPatient.doctorNotes && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                    <strong className="block mb-0.5">Pre-existing Notes:</strong>
                    {inConsultationPatient.doctorNotes}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => handleOpenCompleteModal(inConsultationPatient)}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Consultation & Add Rx Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* NEXT PATIENT HERO CARD */}
          <Card className="border-clinic-300 bg-white shadow-sm overflow-hidden">
            <div className="bg-clinic-50/70 p-4 border-b border-clinic-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-clinic-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-clinic-600" />
                2. Next Patient in Waiting Queue
              </span>
              {nextPatient && (
                <span className="text-xs font-mono font-semibold text-slate-600">
                  Arrived: {nextPatient.checkedInAt || "10:00"}
                </span>
              )}
            </div>

            <CardContent className="p-5 sm:p-6">
              {nextPatient ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <QueueToken tokenNumber={nextPatient.tokenNumber} size="lg" />
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          {nextPatient.patientName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {nextPatient.patientAge} yrs • {nextPatient.patientGender} • Phone: {nextPatient.patientPhone}
                        </p>
                        <p className="text-xs font-semibold text-clinic-700 mt-0.5">
                          Type: {nextPatient.type}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={nextPatient.status} role="doctor" />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                      Chief Complaint / Clinical Symptoms:
                    </span>
                    <p className="text-sm font-medium text-slate-900">
                      "{nextPatient.chiefComplaint}"
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkNoShow(nextPatient)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Mark as No-Show
                    </Button>

                    <Button
                      size="lg"
                      onClick={() => handleStartConsultation(nextPatient)}
                      className="w-full sm:w-auto font-bold bg-clinic-600 hover:bg-clinic-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Call Patient & Start Consultation
                    </Button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Patients Currently Waiting"
                  description="All checked-in patients have been attended to. Check upcoming appointments below."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Live Queue List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200/80 shadow-sm h-full flex flex-col">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Live Waiting Queue</CardTitle>
                <CardDescription className="text-xs">
                  {waitingPatients.length} patient(s) waiting in reception lounge
                </CardDescription>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                Live
              </span>
            </CardHeader>

            <CardContent className="p-4 flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[460px]">
              {waitingPatients.length > 0 ? (
                waitingPatients.map((apt, index) => (
                  <div
                    key={apt.id}
                    className="py-3 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 rounded-xl px-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <QueueToken tokenNumber={apt.tokenNumber} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {apt.patientName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {apt.patientAge}y • {apt.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-mono">
                        #{index + 1} in line
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-2.5"
                        onClick={() => handleStartConsultation(apt)}
                      >
                        Call
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Waiting queue is empty.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          PRIORITY 4: UPCOMING APPOINTMENTS TODAY
          ========================================================================= */}
      <section aria-labelledby="upcoming-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="upcoming-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            4. Upcoming Daytime Schedule (Booked / Awaiting Arrival)
          </h2>
          <span className="text-xs text-slate-500">
            {upcomingBookedPatients.length} booked slots remaining
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingBookedPatients.length > 0 ? (
            upcomingBookedPatients.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 transition-all hover:border-slate-300 hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-clinic-700 bg-clinic-50 border border-clinic-200 px-2 py-0.5 rounded-md">
                      {formatTime(apt.time)}
                    </span>
                    <StatusBadge status={apt.status} role="doctor" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {apt.patientAge} yrs • {apt.patientGender} • {apt.type}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 italic line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{apt.chiefComplaint}"
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Contact: {apt.patientPhone}</span>
                  <button
                    onClick={() => handleMarkNoShow(apt)}
                    className="text-rose-600 hover:text-rose-700 font-medium"
                  >
                    No-Show
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No further booked appointments remaining for today.
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          PRIORITY 5: OPERATIONAL ISSUES & ALERTS
          ========================================================================= */}
      <section aria-labelledby="alerts-heading" className="space-y-3">
        <h2 id="alerts-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          5. Operational Alerts & Clinic Bottlenecks
        </h2>

        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                  alert.severity === "warning"
                    ? "bg-amber-50/70 border-amber-200 text-amber-900"
                    : alert.severity === "critical"
                    ? "bg-rose-50/70 border-rose-200 text-rose-900"
                    : "bg-sky-50/70 border-sky-200 text-sky-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      alert.severity === "warning"
                        ? "text-amber-600"
                        : alert.severity === "critical"
                        ? "text-rose-600"
                        : "text-sky-600"
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-bold">{alert.title}</h4>
                    <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
                    <span className="text-[10px] font-mono opacity-70 block mt-1">
                      Logged at {alert.timestamp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-white/80 border border-slate-200 hover:bg-white text-slate-700 transition-colors"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All operations running smoothly with zero clinical alerts or schedule bottlenecks.</span>
          </div>
        )}
      </section>

      {/* =========================================================================
          PRIORITY 6: SIMPLE ANALYTICS (PRACTICE PERFORMANCE & INCOME)
          ========================================================================= */}
      <section aria-labelledby="analytics-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="analytics-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            6. Today's Performance & Practice Income Visibility
          </h2>
          <Link
            href="/doctor/insights"
            className="text-xs font-semibold text-clinic-700 hover:text-clinic-800 flex items-center gap-1"
          >
            <span>View Comprehensive Monthly Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Today's Realized Income
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {formatCurrency(metrics.totalIncome)}
            </p>
            <p className="text-xs text-emerald-700 mt-1 font-medium">
              ✓ Collected from completed visits
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pending Fees at Reception
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2">
              {formatCurrency(metrics.pendingIncome)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              To be collected by reception desk
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Completion Rate
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-clinic-700 mt-2">
              {metrics.totalAppointments > 0
                ? `${Math.round((metrics.completedCount / metrics.totalAppointments) * 100)}%`
                : "100%"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.noShowCount} no-show, {metrics.cancelledCount} cancelled today
            </p>
          </div>
        </div>
      </section>

      {/* Complete Consultation Dialog */}
      <Dialog
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Clinical Consultation"
        description={`Document medical notes and mark visit finished for ${activeAppointment?.patientName}.`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <strong>Chief Complaint:</strong> {activeAppointment?.chiefComplaint}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Doctor's Prescription & Clinical Summary
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Advised Tab Telmisartan 40mg OD. Low salt diet. Follow-up after 1 month with fasting lipid profile..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleteModalOpen(false)}>
              Keep Open
            </Button>
            <Button variant="success" onClick={handleConfirmComplete}>
              Finalize Visit & Call Next Patient
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
