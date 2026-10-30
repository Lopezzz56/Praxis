"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QueueToken } from "@/components/shared/QueueToken";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Appointment } from "@/lib/types";
import { formatCurrency, formatTime, getTodayDateString } from "@/lib/utils";
import {
  ArrowLeft,
  Stethoscope,
  CheckCircle2,
  Play,
  Clock,
  UserCheck,
  FileEdit,
  XCircle,
  Phone,
  AlertCircle,
} from "lucide-react";

export default function DoctorQueueRoomPage() {
  const {
    todayAppointments,
    callPatient,
    completeConsultation,
    markNoShow,
  } = useClinicStore();
  const { toast } = useToast();

  const [clinicalNotes, setClinicalNotes] = useState("");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const activePatient = todayAppointments.find((a) => a.status === "in_consultation");
  const waitingQueue = todayAppointments
    .filter((a) => a.status === "waiting" || a.status === "checked_in")
    .sort((a, b) => (a.queuePosition || 99) - (b.queuePosition || 99));

  const completedToday = todayAppointments.filter((a) => a.status === "completed");

  const handleCall = (apt: Appointment) => {
    callPatient(apt.id);
    toast({
      title: "Patient Called to Room",
      description: `${apt.patientName} (${apt.tokenNumber || "Next"}) is now in consultation.`,
      type: "success",
    });
  };

  const handleFinishConsultation = () => {
    if (!activePatient) return;
    completeConsultation(activePatient.id, clinicalNotes || activePatient.doctorNotes);
    setCompleteDialogOpen(false);
    setClinicalNotes("");
    toast({
      title: "Consultation Complete",
      description: `Visit closed for ${activePatient.patientName}. Next patient ready in queue.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          href="/doctor"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">Consultation Room 1 Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Focus: Current Consultation Desk (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activePatient ? (
            <Card className="border-purple-200 bg-white shadow-sm ring-1 ring-purple-500/20">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-5 sm:p-6 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <QueueToken tokenNumber={activePatient.tokenNumber} size="lg" isActive />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Currently Inside Consultation Room
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                      {activePatient.patientName}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {activePatient.patientAge} years old • {activePatient.patientGender} • Phone: {activePatient.patientPhone}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-500 block">Session Started</span>
                  <span className="text-base font-mono font-bold text-slate-900">
                    {activePatient.consultationStartedAt || "09:35"}
                  </span>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Chief Complaint / Reported Symptoms
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 leading-relaxed">
                    "{activePatient.chiefComplaint}"
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileEdit className="w-4 h-4 text-clinic-600" />
                      Prescription & Clinical Consultation Notes
                    </h3>
                    <span className="text-xs text-slate-400">Auto-saved to patient record</span>
                  </div>
                  <textarea
                    rows={6}
                    placeholder="Document clinical diagnosis, prescribed medication, dosage, dietary advice, and follow-up timeline..."
                    defaultValue={activePatient.doctorNotes || clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 font-sans"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Fee: <strong>{formatCurrency(activePatient.fee)}</strong> (Payment: <span className="capitalize">{activePatient.paymentStatus}</span>)
                  </div>
                  <Button
                    size="lg"
                    variant="success"
                    onClick={() => setCompleteDialogOpen(true)}
                    className="w-full sm:w-auto font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Visit & Call Next Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-white p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-clinic-50 text-clinic-600 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Consultation Room is Currently Empty
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                No patient is currently in the active consultation room. Select the next waiting patient from the queue to start.
              </p>
              {waitingQueue[0] ? (
                <Button
                  size="lg"
                  onClick={() => handleCall(waitingQueue[0])}
                  className="font-bold bg-clinic-600 hover:bg-clinic-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Call Next Patient ({waitingQueue[0].patientName} • Token {waitingQueue[0].tokenNumber})
                </Button>
              ) : (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 py-2 px-4 rounded-xl inline-block border border-emerald-200">
                  Waiting queue is empty. All arrived patients have been served.
                </p>
              )}
            </Card>
          )}

          {/* Quick Consultation History Today */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Completed Consultations Today ({completedToday.length})
            </h3>
            {completedToday.length > 0 ? (
              <div className="space-y-2">
                {completedToday.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">{apt.patientName}</span>
                        <span className="text-slate-500 ml-2">({apt.patientAge}y, {apt.type})</span>
                        {apt.doctorNotes && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5 line-clamp-1">
                            Notes: "{apt.doctorNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-400 font-mono">Finished {apt.completedAt || "09:28"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No completed consultations yet today.</p>
            )}
          </div>
        </div>

        {/* Live Queue Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Up Next in Waiting Lounge</CardTitle>
                <CardDescription className="text-xs">
                  {waitingQueue.length} patient(s) waiting
                </CardDescription>
              </div>
              <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Live Turn
              </span>
            </CardHeader>

            <CardContent className="p-3 divide-y divide-slate-100">
              {waitingQueue.length > 0 ? (
                waitingQueue.map((apt, idx) => (
                  <div key={apt.id} className="py-3 px-2 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <QueueToken tokenNumber={apt.tokenNumber} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {apt.patientName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {apt.patientAge}y • {apt.type}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 italic line-clamp-1">
                          "{apt.chiefComplaint}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleCall(apt)}
                        className="h-7 text-xs px-2.5"
                      >
                        Call
                      </Button>
                      <button
                        onClick={() => markNoShow(apt.id)}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-medium"
                      >
                        No-show
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No patients waiting in queue.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete Dialog */}
      <Dialog
        isOpen={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        title="Finalize Patient Consultation"
        description={`Confirm completion of visit for ${activePatient?.patientName}.`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This will mark the visit completed, save the notes to their clinical file, and advance the queue for reception and the waiting room.
          </p>

          <div className="pt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Keep Open
            </Button>
            <Button variant="success" onClick={handleFinishConsultation}>
              Confirm & Complete Visit
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
