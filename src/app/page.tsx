"use client";

import React from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Stethoscope,
  Award,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Activity,
  Users,
} from "lucide-react";

export default function PublicDoctorWebsite() {
  const { doctorProfile, metrics } = useClinicStore();

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-teal-50/70 via-white to-white border border-clinic-100 p-6 sm:p-12 lg:p-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-clinic-100/80 text-clinic-800 border border-clinic-200/60 mb-6">
            <span className="w-2 h-2 rounded-full bg-clinic-600 animate-pulse" />
            <span>Consultations Open Today • Clinic Live Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Personalized Medical Care with{" "}
            <span className="text-clinic-700">{doctorProfile.name}</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            {doctorProfile.title} with {doctorProfile.experienceYears}+ years of clinical mastery in internal medicine, hypertension, and preventive cardiometabolic care.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/patient/book">
              <Button size="lg" className="w-full sm:w-auto font-bold bg-clinic-600 hover:bg-clinic-700 shadow-md">
                <Calendar className="w-4 h-4 mr-2" />
                Book Your Appointment
              </Button>
            </Link>
            <Link href="/patient">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                Track Live Queue Status
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Quick Doctor Badges */}
          <div className="mt-8 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Experience</span>
              <span className="text-sm font-bold text-slate-900">{doctorProfile.experienceYears}+ Years</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Medical Reg #</span>
              <span className="text-sm font-bold text-slate-900">{doctorProfile.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Consultation Fee</span>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(doctorProfile.consultationFee)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Today's Queue</span>
              <span className="text-sm font-bold text-emerald-700">{metrics.waitingCount} Waiting Now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties & Clinical Focus */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-clinic-700">
            Clinical Expertise
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Core Areas of Medical Care
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Evidence-based diagnosis, compassionate care, and customized management plans.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctorProfile.specialties.map((specialty, index) => (
            <Card
              key={index}
              className="border-slate-200/80 hover:border-clinic-300 hover:shadow-sm transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-clinic-50 text-clinic-700 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{specialty}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Comprehensive evaluation, continuous monitoring, and tailored follow-up.
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Practice Hours & Clinic Location */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-clinic-100 text-clinic-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Clinic Timings</h3>
              <p className="text-xs text-slate-500">{doctorProfile.workingHours.days}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm divide-y divide-slate-100">
            <div className="flex justify-between py-2">
              <span className="text-slate-600 font-medium">Morning Clinic Session</span>
              <span className="font-bold text-slate-900">{doctorProfile.workingHours.morning}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600 font-medium">Evening Clinic Session</span>
              <span className="font-bold text-slate-900">{doctorProfile.workingHours.evening}</span>
            </div>
            <div className="flex justify-between py-2 text-rose-600">
              <span className="font-medium">Sunday</span>
              <span className="font-bold">Closed (Emergency On-Call)</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-clinic-100 text-clinic-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Clinic Location & Contact</h3>
              <p className="text-xs text-slate-500">{doctorProfile.clinicName}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-slate-700 leading-relaxed">
              {doctorProfile.address}
            </p>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-clinic-600" />
                <span>Phone / Reception Desk: <strong>{doctorProfile.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-clinic-600" />
                <span>Direct Email: <strong>{doctorProfile.email}</strong></span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Role Switcher Hub Banner for Evaluators / Users */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Internal Clinic Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Access Practice Portals
          </h2>
          <p className="text-slate-300 text-sm mt-2">
            Switch between roles to test the live synchronized workflow:
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/patient"
              className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-teal-300 block mb-1">Patient Portal</span>
                <span className="text-xs text-slate-300">Book visit, track turn, cancel or reschedule.</span>
              </div>
              <span className="text-xs text-teal-400 font-semibold mt-3 flex items-center gap-1">
                Enter <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/doctor"
              className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-teal-300 block mb-1">Doctor Portal</span>
                <span className="text-xs text-slate-300">Workload, queue management, next patient, insights.</span>
              </div>
              <span className="text-xs text-teal-400 font-semibold mt-3 flex items-center gap-1">
                Enter <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/reception"
              className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-teal-300 block mb-1">Reception Desk</span>
                <span className="text-xs text-slate-300">Add walk-ins, check in booked patients, collect fees.</span>
              </div>
              <span className="text-xs text-teal-400 font-semibold mt-3 flex items-center gap-1">
                Enter <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

