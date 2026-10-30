"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency, getTodayDateString } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  Stethoscope,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const VISIT_TYPES = [
  { value: "Regular Checkup", label: "Regular Checkup", desc: "General symptoms, annual check, physical" },
  { value: "Follow-up", label: "Follow-up Consultation", desc: "Reviewing previous prescription or test reports" },
  { value: "Chronic Care", label: "Chronic Care Review", desc: "Hypertension, Diabetes, Thyroid monitoring" },
  { value: "Urgent Consultation", label: "Urgent Care", desc: "Fever, acute pain, migraine, sudden discomfort" },
] as const;

const AVAILABLE_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "16:30", "17:00", "17:30", "18:00", "18:30", "19:00",
];

export default function PatientBookPage() {
  const router = useRouter();
  const { doctorProfile, bookAppointment } = useClinicStore();
  const { toast } = useToast();

  const todayStr = getTodayDateString();
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<string>("Regular Checkup");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>("10:00");

  // Form State
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "Male" as "Male" | "Female" | "Other",
    patientPhone: "",
    chiefComplaint: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientName.trim()) {
      newErrors.patientName = "Please enter patient full name";
    }
    const age = parseInt(formData.patientAge, 10);
    if (!formData.patientAge || isNaN(age) || age < 1 || age > 120) {
      newErrors.patientAge = "Please enter a valid age (1-120)";
    }
    if (!formData.patientPhone.trim() || formData.patientPhone.length < 10) {
      newErrors.patientPhone = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = "Please describe the reason for your visit";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newApt = bookAppointment({
      patientName: formData.patientName.trim(),
      patientAge: parseInt(formData.patientAge, 10),
      patientGender: formData.patientGender,
      patientPhone: formData.patientPhone.trim(),
      date: selectedDate,
      time: selectedTime,
      type: selectedType as any,
      chiefComplaint: formData.chiefComplaint.trim(),
    });

    setCreatedAppointmentId(newApt.id);
    setStep(4);
    toast({
      title: "Appointment Confirmed!",
      description: `Your consultation with ${doctorProfile.name} is scheduled for ${selectedTime}.`,
      type: "success",
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/patient"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Portal</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Step {step} of 3
        </span>
      </div>

      {step < 4 ? (
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-clinic-100 text-clinic-700 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Book a Doctor Visit</CardTitle>
                <CardDescription>
                  Direct appointment with {doctorProfile.name} ({doctorProfile.title})
                </CardDescription>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                { s: 1, label: "1. Reason & Date" },
                { s: 2, label: "2. Time Slot" },
                { s: 3, label: "3. Patient Details" },
              ].map(({ s, label }) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    step >= s ? "bg-clinic-600" : "bg-slate-200"
                  }`}
                  title={label}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Step 1: Visit Type & Date */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    What is the primary reason for your visit?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VISIT_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`p-4 rounded-xl border text-left transition-all min-h-[56px] flex flex-col justify-center ${
                          selectedType === type.value
                            ? "border-clinic-600 bg-clinic-50/60 ring-2 ring-clinic-500/20 text-clinic-900"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800"
                        }`}
                      >
                        <span className="font-semibold text-sm">{type.label}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{type.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Select Consultation Date
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayStr)}
                      className={`p-3 rounded-xl border text-center transition-all min-h-[48px] ${
                        selectedDate === todayStr
                          ? "border-clinic-600 bg-clinic-600 text-white font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs uppercase tracking-wider opacity-80">Today</span>
                      <span className="text-sm font-medium">Quick Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(tomorrowStr)}
                      className={`p-3 rounded-xl border text-center transition-all min-h-[48px] ${
                        selectedDate === tomorrowStr
                          ? "border-clinic-600 bg-clinic-600 text-white font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block text-xs uppercase tracking-wider opacity-80">Tomorrow</span>
                      <span className="text-sm font-medium">Next Day</span>
                    </button>
                    <div className="relative">
                      <input
                        type="date"
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs text-center focus:ring-2 focus:ring-clinic-500 focus:outline-none min-h-[48px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Continue to Select Time
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Time Slot */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-800">
                      Available Time Slots on {selectedDate === todayStr ? "Today" : selectedDate}
                    </label>
                    <span className="text-xs text-slate-500">15-minute consultations</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {AVAILABLE_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 px-2 rounded-xl text-sm font-medium transition-all text-center border min-h-[44px] ${
                            isSelected
                              ? "bg-clinic-600 text-white border-clinic-700 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-clinic-600 shrink-0" />
                  <span>
                    Selected: <strong>{selectedTime}</strong> on <strong>{selectedDate}</strong> for <strong>{selectedType}</strong>.
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" size="lg" onClick={() => setStep(3)}>
                    Continue to Patient Details
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Patient Form */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Patient Full Name"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  error={errors.patientName}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Patient Age"
                    type="number"
                    required
                    placeholder="e.g. 52"
                    value={formData.patientAge}
                    onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    error={errors.patientAge}
                  />

                  <Select
                    label="Gender"
                    required
                    value={formData.patientGender}
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                    onChange={(e) =>
                      setFormData({ ...formData, patientGender: e.target.value as any })
                    }
                  />
                </div>

                <Input
                  label="Mobile Contact Number"
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  error={errors.patientPhone}
                  helperText="You will receive real-time queue notifications and booking updates here."
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Chief Health Concern / Symptoms <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what you're experiencing (e.g. mild fever since 2 days, checking blood pressure, headache)..."
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-clinic-500 ${
                      errors.chiefComplaint ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                  {errors.chiefComplaint && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">• {errors.chiefComplaint}</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="w-5 h-5 text-clinic-600" />
                    <span>Doctor Consultation Fee</span>
                  </div>
                  <span className="font-bold text-slate-900 text-base">
                    {formatCurrency(doctorProfile.consultationFee)}
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Confirm Appointment
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Step 4: Booking Confirmation Card */
        <Card className="border-emerald-200 bg-white shadow-md text-center p-6 sm:p-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Appointment Confirmed!
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
            Your appointment has been registered on the clinic schedule. Reception and Dr. Vance have received your details.
          </p>

          <div className="my-6 p-5 rounded-2xl border border-slate-100 bg-slate-50/80 text-left max-w-md mx-auto space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-xs text-slate-500">
              <span>Appointment ID</span>
              <span className="font-mono font-bold text-slate-800">{createdAppointmentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-900">{formData.patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-semibold text-slate-900">{doctorProfile.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date & Slot:</span>
              <span className="font-semibold text-clinic-700">
                {selectedDate} at {selectedTime}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Consultation Fee:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(doctorProfile.consultationFee)} (Pay at Clinic)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => router.push("/patient")}
              size="lg"
              className="w-full sm:w-auto"
            >
              Go to Patient Portal & Track Turn
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep(1);
                setFormData({
                  patientName: "",
                  patientAge: "",
                  patientGender: "Male",
                  patientPhone: "",
                  chiefComplaint: "",
                });
              }}
              size="lg"
              className="w-full sm:w-auto"
            >
              Book Another Visit
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

