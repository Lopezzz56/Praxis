"use client";

import { useEffect, useState, useCallback } from "react";
import { Appointment, AppointmentStatus, DailyMetrics, PaymentStatus, OperationalAlert } from "./types";
import { INITIAL_APPOINTMENTS, INITIAL_ALERTS, DOCTOR_PROFILE } from "./mock-data";
import { getTodayDateString } from "./utils";

const STORAGE_KEY = "vance_clinic_appointments_v1";
const ALERTS_STORAGE_KEY = "vance_clinic_alerts_v1";
const EVENT_KEY = "vance_clinic_store_update";

function getStoredAppointments(): Appointment[] {
  if (typeof window === "undefined") return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

function getStoredAlerts(): OperationalAlert[] {
  if (typeof window === "undefined") return INITIAL_ALERTS;
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ALERTS;
  }
}

function saveAppointments(appointments: Appointment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (err) {
    console.error("Failed to persist appointments:", err);
  }
}

function saveAlerts(alerts: OperationalAlert[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new Event(EVENT_KEY));
  } catch (err) {
    console.error("Failed to persist alerts:", err);
  }
}

function recalculateQueue(appointments: Appointment[]): Appointment[] {
  // Ordered waiting and checked_in queue
  const waitingPatients = appointments.filter(
    (a) => a.date === getTodayDateString() && (a.status === "waiting" || a.status === "checked_in")
  );

  let position = 1;
  const positionMap = new Map<string, number>();
  for (const patient of waitingPatients) {
    positionMap.set(patient.id, position++);
  }

  return appointments.map((apt) => {
    if (apt.status === "in_consultation") {
      return { ...apt, queuePosition: 0 };
    }
    if (positionMap.has(apt.id)) {
      return { ...apt, queuePosition: positionMap.get(apt.id) };
    }
    return { ...apt, queuePosition: undefined };
  });
}

function getNextTokenNumber(appointments: Appointment[]): string {
  const existingTokens = appointments
    .map((a) => a.tokenNumber)
    .filter((t): t is string => Boolean(t && t.startsWith("A-")))
    .map((t) => parseInt(t.replace("A-", ""), 10))
    .filter((n) => !isNaN(n));

  const maxNum = existingTokens.length > 0 ? Math.max(...existingTokens) : 0;
  const nextNum = maxNum + 1;
  return `A-${nextNum.toString().padStart(2, "0")}`;
}

export function useClinicStore() {
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(getStoredAlerts);

  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getStoredAppointments());
      setAlerts(getStoredAlerts());
    };

    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const bookAppointment = useCallback(
    (data: {
      patientName: string;
      patientAge: number;
      patientGender: "Male" | "Female" | "Other";
      patientPhone: string;
      date: string;
      time: string;
      type: Appointment["type"];
      chiefComplaint: string;
    }) => {
      const current = getStoredAppointments();
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: `pat-${Date.now().toString().slice(-4)}`,
        doctorName: DOCTOR_PROFILE.name,
        status: "booked",
        paymentStatus: "pending",
        fee: DOCTOR_PROFILE.consultationFee,
        ...data,
      };
      const updated = [newAppointment, ...current];
      saveAppointments(updated);
      return newAppointment;
    },
    []
  );

  const addWalkIn = useCallback(
    (data: {
      patientName: string;
      patientAge: number;
      patientGender: "Male" | "Female" | "Other";
      patientPhone: string;
      chiefComplaint: string;
      type?: Appointment["type"];
      paymentStatus?: PaymentStatus;
    }) => {
      const current = getStoredAppointments();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const token = getNextTokenNumber(current);

      const newWalkIn: Appointment = {
        id: `apt-walkin-${Date.now()}`,
        tokenNumber: token,
        patientId: `pat-${Date.now().toString().slice(-4)}`,
        patientName: data.patientName,
        patientAge: data.patientAge,
        patientGender: data.patientGender,
        patientPhone: data.patientPhone,
        doctorName: DOCTOR_PROFILE.name,
        date: getTodayDateString(),
        time: timeStr,
        type: data.type || "Urgent Consultation",
        status: "waiting",
        paymentStatus: data.paymentStatus || "pending",
        fee: DOCTOR_PROFILE.consultationFee,
        chiefComplaint: data.chiefComplaint,
        checkedInAt: timeStr,
        isWalkIn: true,
      };

      const recalculated = recalculateQueue([newWalkIn, ...current]);
      saveAppointments(recalculated);
      return newWalkIn;
    },
    []
  );

  const checkInPatient = useCallback((appointmentId: string) => {
    const current = getStoredAppointments();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        const token = a.tokenNumber || getNextTokenNumber(current);
        return {
          ...a,
          status: "waiting" as AppointmentStatus,
          tokenNumber: token,
          checkedInAt: a.checkedInAt || timeStr,
        };
      }
      return a;
    });

    const recalculated = recalculateQueue(updated);
    saveAppointments(recalculated);
  }, []);

  const callPatient = useCallback((appointmentId: string) => {
    const current = getStoredAppointments();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // If any patient is already in consultation, we don't automatically overwrite unless specified
    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: "in_consultation" as AppointmentStatus,
          consultationStartedAt: a.consultationStartedAt || timeStr,
          queuePosition: 0,
        };
      }
      return a;
    });

    const recalculated = recalculateQueue(updated);
    saveAppointments(recalculated);
  }, []);

  const completeConsultation = useCallback((appointmentId: string, doctorNotes?: string) => {
    const current = getStoredAppointments();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: "completed" as AppointmentStatus,
          completedAt: timeStr,
          doctorNotes: doctorNotes !== undefined ? doctorNotes : a.doctorNotes,
          queuePosition: undefined,
        };
      }
      return a;
    });

    const recalculated = recalculateQueue(updated);
    saveAppointments(recalculated);
  }, []);

  const cancelAppointment = useCallback((appointmentId: string, reason?: string) => {
    const current = getStoredAppointments();
    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: "cancelled" as AppointmentStatus,
          chiefComplaint: reason ? `${a.chiefComplaint} (Cancelled: ${reason})` : a.chiefComplaint,
          queuePosition: undefined,
        };
      }
      return a;
    });

    const recalculated = recalculateQueue(updated);
    saveAppointments(recalculated);
  }, []);

  const markNoShow = useCallback((appointmentId: string) => {
    const current = getStoredAppointments();
    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        return {
          ...a,
          status: "no_show" as AppointmentStatus,
          queuePosition: undefined,
        };
      }
      return a;
    });

    const recalculated = recalculateQueue(updated);
    saveAppointments(recalculated);
  }, []);

  const rescheduleAppointment = useCallback(
    (appointmentId: string, newDate: string, newTime: string) => {
      const current = getStoredAppointments();
      const updated = current.map((a) => {
        if (a.id === appointmentId) {
          return {
            ...a,
            date: newDate,
            time: newTime,
            status: "booked" as AppointmentStatus,
            queuePosition: undefined,
          };
        }
        return a;
      });

      const recalculated = recalculateQueue(updated);
      saveAppointments(recalculated);
    },
    []
  );

  const updatePaymentStatus = useCallback((appointmentId: string, paymentStatus: PaymentStatus) => {
    const current = getStoredAppointments();
    const updated = current.map((a) => {
      if (a.id === appointmentId) {
        return { ...a, paymentStatus };
      }
      return a;
    });
    saveAppointments(updated);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    const current = getStoredAlerts();
    const updated = current.filter((al) => al.id !== alertId);
    saveAlerts(updated);
  }, []);

  const resetToDefaultData = useCallback(() => {
    saveAppointments(INITIAL_APPOINTMENTS);
    saveAlerts(INITIAL_ALERTS);
  }, []);

  // Compute live today's metrics
  const today = getTodayDateString();
  const todayAppointments = appointments.filter((a) => a.date === today);
  const waitingCount = todayAppointments.filter((a) => a.status === "waiting" || a.status === "checked_in").length;
  const inConsultationCount = todayAppointments.filter((a) => a.status === "in_consultation").length;
  const completedCount = todayAppointments.filter((a) => a.status === "completed").length;
  const noShowCount = todayAppointments.filter((a) => a.status === "no_show").length;
  const cancelledCount = todayAppointments.filter((a) => a.status === "cancelled").length;

  const totalIncome = todayAppointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const pendingIncome = todayAppointments
    .filter((a) => a.paymentStatus === "pending" && a.status !== "cancelled" && a.status !== "no_show")
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const metrics: DailyMetrics = {
    totalAppointments: todayAppointments.length,
    waitingCount,
    inConsultationCount,
    completedCount,
    noShowCount,
    cancelledCount,
    totalIncome,
    pendingIncome,
    averageWaitTimeMinutes: 14,
  };

  return {
    appointments,
    todayAppointments,
    alerts,
    metrics,
    doctorProfile: DOCTOR_PROFILE,
    bookAppointment,
    addWalkIn,
    checkInPatient,
    callPatient,
    completeConsultation,
    cancelAppointment,
    markNoShow,
    rescheduleAppointment,
    updatePaymentStatus,
    dismissAlert,
    resetToDefaultData,
  };
}

