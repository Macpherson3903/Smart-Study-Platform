import { StudyInputForm } from "@/components/features/generation/StudyInputForm";

export default function NewSessionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-slate-900">
          New study session
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Paste any academic text and generate a focused study pack.
        </p>
      </div>

      <StudyInputForm />
    </div>
  );
}

