"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, formatTime } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Heart,
  Pill,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function PatientProfilePage() {
  const { appointments, doctorProfile } = useClinicStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Meera Subramanian",
    age: 42,
    gender: "Female",
    phone: "+91 98440 98765",
    bloodGroup: "B+ Positive",
    allergies: "Penicillin (mild hives)",
    chronicConditions: "Mild Seasonal Bronchial Asthma",
    emergencyContact: "Anand Subramanian (Husband) - +91 98440 12345",
  });

  const patientVisits = appointments.filter((a) => a.patientName === profile.name || a.id === "apt-02");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Medical demographics and emergency details saved successfully.",
      type: "success",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/patient"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patient Portal</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Patient Health Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Personal medical summary and past consultations with {doctorProfile.name}.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-clinic-100 text-clinic-700 flex items-center justify-center font-bold text-lg">
              MS
            </div>
            <div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <span className="text-xs text-slate-500">
                {profile.age} years old • {profile.gender} • Blood Group: {profile.bloodGroup}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Age"
                  type="number"
                  value={profile.age.toString()}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
                />
                <Input
                  label="Contact Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <Input
                label="Known Drug Allergies"
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              />
              <Input
                label="Emergency Contact"
                value={profile.emergencyContact}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              />
              <div className="pt-2 flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Phone Number</span>
                <span className="font-semibold text-slate-900">{profile.phone}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Blood Group</span>
                <span className="font-semibold text-slate-900">{profile.bloodGroup}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Known Drug Allergies</span>
                <span className="font-semibold text-rose-700">{profile.allergies}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">Emergency Contact</span>
                <span className="font-semibold text-slate-900">{profile.emergencyContact}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation History */}
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="p-5 border-b border-slate-100">
          <CardTitle className="text-base">Consultation History with Dr. Vance</CardTitle>
          <span className="text-xs text-slate-400">Past prescriptions and clinical findings</span>
        </CardHeader>
        <CardContent className="p-5 divide-y divide-slate-100">
          {patientVisits.map((visit) => (
            <div key={visit.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {formatDate(visit.date)} at {formatTime(visit.time)}
                </span>
                <StatusBadge status={visit.status} role="patient" />
              </div>
              <p className="text-xs text-slate-700">
                <strong>Chief Complaint:</strong> "{visit.chiefComplaint}"
              </p>
              {visit.doctorNotes && (
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900">
                  <strong className="block mb-0.5">Doctor's Clinical Notes:</strong>
                  {visit.doctorNotes}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

