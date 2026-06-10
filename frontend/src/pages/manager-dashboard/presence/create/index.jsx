"use client";
import React from "react";
import DashboardLayout from "../../layout";
import PropertyStepper from "../../components/stepper/PropertyStepper";

export default function CreatePropertyPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen text-[var(--text-body)] bg-[var(--bg-hover)] rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">ثبت ملک جدید</h1>
        <PropertyStepper />
      </div>
    </DashboardLayout>
  );
}
