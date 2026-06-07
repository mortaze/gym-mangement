import usePropertyStepper from "@/hooks/usePropertyStepper";

const steps = [
  "وضعیت",
  "هویت",
  "موقعیت",
  "وضعیت حقوقی",
  "مالکیت",
  "حدود",
  "اطلاعات تکمیلی",
];

export default function PropertyStepper({ onSubmit }) {
  const { currentStep, next, prev } = usePropertyStepper();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl border px-3 py-2 text-center text-sm font-bold ${
              index === currentStep
                ? "border-yellow-400 bg-yellow-50 text-gray-900"
                : "border-gray-200 bg-gray-50 text-gray-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
        فرم مرحله «{steps[currentStep]}» آماده اتصال به داده‌های ملک است.
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={currentStep === 0}
          className="rounded-xl bg-gray-200 px-5 py-2 font-bold text-gray-700 disabled:opacity-50"
        >
          قبلی
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-yellow-400 px-5 py-2 font-black text-black"
          >
            بعدی
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-green-500 px-5 py-2 font-black text-white"
          >
            ثبت نهایی
          </button>
        )}
      </div>
    </div>
  );
}
