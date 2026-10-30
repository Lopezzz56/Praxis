"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QueueToken } from "@/components/shared/QueueToken";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Appointment } from "@/lib/types";
import { formatCurrency, formatDate, formatTime, getTodayDateString } from "@/lib/utils";
import {
  Calendar,
  Clock,
  PlusCircle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Stethoscope,
  XCircle,
  CalendarCheck,
} from "lucide-react";

export default function PatientPortalPage() {
  const { appointments, doctorProfile, cancelAppointment, rescheduleAppointment } = useClinicStore();
  const { toast } = useToast();
  const today = getTodayDateString();

  // Dialog states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [newDate, setNewDate] = useState(today);
  const [newTime, setNewTime] = useState("11:00");

  // Today's active queue item for the demo patient (e.g. Meera Subramanian Token A-02 or user's newly created appointment)
  const activeTodayAppointments = appointments.filter(
    (a) => a.date === today && (a.status === "waiting" || a.status === "in_consultation" || a.status === "checked_in" || a.status === "booked")
  );

  const featuredAppointment = activeTodayAppointments[0] || appointments[0];

  const handleOpenCancel = (apt: Appointment) => {
    setActiveAppointment(apt);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!activeAppointment) return;
    cancelAppointment(activeAppointment.id, cancelReason || "Patient requested cancellation");
    setCancelModalOpen(false);
    toast({
      title: "Appointment Cancelled",
      description: `Your appointment for ${activeAppointment.patientName} has been cancelled.`,
      type: "warning",
    });
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setActiveAppointment(apt);
    setNewDate(apt.date);
    setNewTime(apt.time);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!activeAppointment) return;
    rescheduleAppointment(activeAppointment.id, newDate, newTime);
    setRescheduleModalOpen(false);
    toast({
      title: "Appointment Rescheduled",
      description: `New visit confirmed for ${formatDate(newDate)} at ${formatTime(newTime)}.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Patient Hero / Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-clinic-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs inline-block mb-3">
            Patient Portal & Live Turn Status
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Consult Dr. Elena Vance
          </h1>
          <p className="mt-2 text-teal-100 text-sm sm:text-base leading-relaxed">
            Book appointments, track your live token position in the clinic queue, and manage your visits with one click.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/patient/book">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-clinic-800 hover:bg-teal-50 font-bold shadow-sm"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Book New Appointment
              </Button>
            </Link>
            <a
              href="#appointments-list"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors border border-white/20 min-h-[44px]"
            >
              View All My Appointments
            </a>
          </div>
        </div>
      </div>

      {/* Primary Question: How do I know my turn? (Live Queue Turn Tracker) */}
      <section aria-labelledby="live-queue-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="live-queue-heading" className="text-xl font-bold text-slate-900 tracking-tight">
              Live Clinic Turn & Queue Status
            </h2>
            <p className="text-xs text-slate-500">
              Real-time synchronization with Dr. Vance’s consultation desk
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Connected
          </span>
        </div>

        {featuredAppointment ? (
          <Card className="border-clinic-200/90 bg-white shadow-sm overflow-hidden">
            <div className="bg-clinic-50/70 border-b border-clinic-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <QueueToken
                  tokenNumber={featuredAppointment.tokenNumber || "A-02"}
                  size="lg"
                  isActive={featuredAppointment.status === "in_consultation"}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Token Number
                    </span>
                    <StatusBadge status={featuredAppointment.status} role="patient" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {featuredAppointment.patientName}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {featuredAppointment.type} • {formatDate(featuredAppointment.date)} at{" "}
                    {formatTime(featuredAppointment.time)}
                  </p>
                </div>
              </div>

              {/* Turn estimation indicator */}
              <div className="rounded-xl border border-clinic-200 bg-white p-3.5 text-left sm:text-right">
                <p className="text-xs text-slate-500 font-medium">Estimated Status</p>
                {featuredAppointment.status === "in_consultation" ? (
                  <p className="text-sm font-bold text-purple-700 flex items-center sm:justify-end gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    Currently in consultation room
                  </p>
                ) : featuredAppointment.status === "waiting" ? (
                  <p className="text-sm font-bold text-amber-800 flex items-center sm:justify-end gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    {featuredAppointment.queuePosition && featuredAppointment.queuePosition > 1
                      ? `${featuredAppointment.queuePosition - 1} patient(s) ahead of you`
                      : "You are NEXT in line"}
                  </p>
                ) : featuredAppointment.status === "checked_in" ? (
                  <p className="text-sm font-semibold text-teal-700 mt-0.5">
                    Checked in • Waiting for call
                  </p>
                ) : featuredAppointment.status === "completed" ? (
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                    Visit completed today
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    Slot Confirmed • Please arrive 10 min early
                  </p>
                )}
              </div>
            </div>

            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Consulting Doctor</span>
                  <span className="font-semibold text-slate-900">{doctorProfile.name}</span>
                  <span className="text-xs text-slate-500 block mt-0.5">{doctorProfile.title}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Clinic Address</span>
                  <span className="font-semibold text-slate-900">{doctorProfile.clinicName}</span>
                  <span className="text-xs text-slate-500 block mt-0.5 truncate">{doctorProfile.address}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Consultation Fee</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(featuredAppointment.fee)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Payment: <strong className="capitalize">{featuredAppointment.paymentStatus}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons for Patient */}
              {featuredAppointment.status !== "completed" && featuredAppointment.status !== "cancelled" && (
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Need to modify? You can reschedule or cancel anytime before your call.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReschedule(featuredAppointment)}
                    >
                      Reschedule Slot
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleOpenCancel(featuredAppointment)}
                    >
                      Cancel Visit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No Active Turn Right Now"
            description="You do not have a live appointment in progress today. Book a visit or check upcoming schedules below."
            actionLabel="Book a Visit"
            onAction={() => window.location.assign("/patient/book")}
          />
        )}
      </section>

      {/* All Appointments List */}
      <section id="appointments-list" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Your Appointment Records
          </h2>
          <span className="text-xs text-slate-500">
            Showing {appointments.length} recorded appointments
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {appointments.map((apt) => {
            const isToday = apt.date === today;
            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 shrink-0 text-center min-w-[56px]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {isToday ? "Today" : "Date"}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {apt.date.split("-").slice(1).join("/")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{apt.patientName}</span>
                      <StatusBadge status={apt.status} role="patient" />
                      {apt.tokenNumber && (
                        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Token {apt.tokenNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {apt.type} • {formatTime(apt.time)} • Dr. Vance
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 italic line-clamp-1">
                      Reason: "{apt.chiefComplaint}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {apt.status === "completed" ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : apt.status === "cancelled" ? (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                      Cancelled
                    </span>
                  ) : apt.status === "no_show" ? (
                    <span className="text-xs font-medium text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                      Missed Appointment
                    </span>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReschedule(apt)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleOpenCancel(apt)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reschedule Dialog */}
      <Dialog
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        description="Choose a convenient new date and slot for your visit."
      >
        <div className="space-y-4">
          <Input
            label="Selected Date"
            type="date"
            min={today}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Available Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["09:30", "10:00", "10:30", "11:30", "16:30", "17:30"].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setNewTime(time)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    newTime === time
                      ? "bg-clinic-600 text-white border-clinic-700"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setRescheduleModalOpen(false)}>
              Keep Current Slot
            </Button>
            <Button onClick={handleConfirmReschedule}>
              Confirm New Slot
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        description="Are you sure you need to cancel this visit with Dr. Vance?"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            Cancelling will release your slot to other waiting patients. You can re-book anytime.
          </div>

          <Input
            label="Reason for cancellation (optional)"
            placeholder="e.g. Schedule conflict, feeling better..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

