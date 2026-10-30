export type AppointmentStatus =
  | 'booked'
  | 'checked_in'
  | 'waiting'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type UserRole = 'patient' | 'doctor' | 'reception';

export interface RoleStatusDisplay {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const STATUS_ROLE_MAPPING: Record<AppointmentStatus, Record<UserRole, string>> = {
  booked: {
    patient: 'Confirmed',
    doctor: 'Booked',
    reception: 'Booked',
  },
  checked_in: {
    patient: 'Checked in',
    doctor: 'Checked in',
    reception: 'Checked in',
  },
  waiting: {
    patient: 'You are waiting',
    doctor: 'Waiting',
    reception: 'Waiting',
  },
  in_consultation: {
    patient: 'In consultation',
    doctor: 'In consultation',
    reception: 'In consultation',
  },
  completed: {
    patient: 'Visit completed',
    doctor: 'Completed',
    reception: 'Completed',
  },
  cancelled: {
    patient: 'Cancelled',
    doctor: 'Cancelled',
    reception: 'Cancelled',
  },
  no_show: {
    patient: 'Missed appointment',
    doctor: 'No-show',
    reception: 'No-show',
  },
};

export const STATUS_STYLE_CONFIG: Record<AppointmentStatus, { badge: string; dot: string; text: string }> = {
  booked: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
    dot: 'bg-sky-500',
    text: 'text-sky-700',
  },
  checked_in: {
    badge: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20',
    dot: 'bg-teal-500',
    text: 'text-teal-700',
  },
  waiting: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    dot: 'bg-amber-500 animate-pulse',
    text: 'text-amber-800',
  },
  in_consultation: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
    dot: 'bg-purple-500 animate-ping',
    text: 'text-purple-700',
  },
  completed: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  cancelled: {
    badge: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20',
    dot: 'bg-slate-400',
    text: 'text-slate-600',
  },
  no_show: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
  },
};

export type PaymentStatus = 'paid' | 'pending' | 'waived';

export interface Appointment {
  id: string;
  tokenNumber?: string; // e.g. "A-01" when checked in/waiting
  queuePosition?: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'Regular Checkup' | 'Follow-up' | 'Urgent Consultation' | 'Chronic Care' | 'Lab Review';
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  fee: number;
  chiefComplaint: string;
  doctorNotes?: string;
  checkedInAt?: string;
  consultationStartedAt?: string;
  completedAt?: string;
  isWalkIn?: boolean;
}

export interface DoctorProfile {
  name: string;
  title: string;
  qualifications: string;
  experienceYears: number;
  registrationNumber: string;
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  consultationFee: number;
  workingHours: {
    morning: string;
    evening: string;
    days: string;
  };
  specialties: string[];
}

export interface OperationalAlert {
  id: string;
  type: 'delay' | 'payment_pending' | 'unconfirmed' | 'high_volume';
  title: string;
  message: string;
  appointmentId?: string;
  severity: 'warning' | 'critical' | 'info';
  timestamp: string;
}

export interface DailyMetrics {
  totalAppointments: number;
  waitingCount: number;
  inConsultationCount: number;
  completedCount: number;
  noShowCount: number;
  cancelledCount: number;
  totalIncome: number;
  pendingIncome: number;
  averageWaitTimeMinutes: number;
}

