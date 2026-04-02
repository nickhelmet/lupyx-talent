"use client";

const steps = [
  { key: "PENDING", label: "Postulado" },
  { key: "REVIEWING", label: "En revisión" },
  { key: "INTERVIEW", label: "Entrevista" },
  { key: "RESULT", label: "Resultado" },
];

const resultStatuses = ["ACCEPTED", "REJECTED", "HIRED"];

export default function ApplicationProgress({ status }: { status: string }) {
  const isResult = resultStatuses.includes(status);
  const currentIdx = isResult
    ? 3
    : steps.findIndex((s) => s.key === status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isActive = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${i === 0 ? "bg-transparent" : isActive ? "bg-[#2EC4B6]" : "bg-gray-200 dark:bg-white/10"}`} />
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                isCurrent
                  ? "bg-[#2EC4B6] text-white ring-4 ring-[#2EC4B6]/20"
                  : isActive
                  ? "bg-[#2EC4B6] text-white"
                  : "bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-gray-600"
              }`}>
                {i + 1}
              </div>
              <div className={`h-1.5 flex-1 rounded-full transition-colors ${i === steps.length - 1 ? "bg-transparent" : i < activeIdx ? "bg-[#2EC4B6]" : "bg-gray-200 dark:bg-white/10"}`} />
            </div>
            <span className={`mt-1 text-[10px] font-medium ${isCurrent ? "text-[#2EC4B6]" : "text-[#1F4E79]/40 dark:text-gray-600"}`}>
              {i === 3 && isResult ? (status === "REJECTED" ? "Rechazado" : status === "HIRED" ? "Contratado" : "Aceptado") : step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
