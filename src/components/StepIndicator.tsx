"use client";

interface Props {
  currentStep: number; // 1–4
  completedSteps: number[];
}

const STEPS = [
  { number: 1, label: "Car" },
  { number: 2, label: "Build" },
  { number: 3, label: "Setup" },
  { number: 4, label: "Tune" },
];

export default function StepIndicator({ currentStep, completedSteps }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const isActive    = step.number === currentStep;
        const isCompleted = completedSteps.includes(step.number);
        const isFuture    = step.number > currentStep && !isCompleted;
        const isLast      = idx === STEPS.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500 text-black ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-slate-900"
                    : isCompleted
                    ? "bg-cyan-900 text-cyan-400 border border-cyan-600"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {isCompleted && !isActive ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-cyan-400"
                    : isCompleted
                    ? "text-slate-400"
                    : isFuture
                    ? "text-slate-600"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-12 sm:w-20 h-px mt-[-14px] mx-1 transition-colors duration-200 ${
                  isCompleted ? "bg-cyan-700" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
