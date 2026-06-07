"use client";

import { useState } from "react";

export default function usePropertyStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [propertyId, setPropertyId] = useState(null);

  const next = () => setCurrentStep((s) => s + 1);
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return {
    currentStep,
    setCurrentStep,
    next,
    prev,
    propertyId,
    setPropertyId,
  };
}
