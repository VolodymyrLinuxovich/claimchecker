import { ui } from "@/lib/ui-styles";

type Props = {
  value: "US" | "EU";
  onChange: (value: "US" | "EU") => void;
};

export default function JurisdictionSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className={ui.label}>Jurisdiction</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("US")}
          className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
            value === "US"
              ? "border-teal-500/35 bg-teal-950/50 text-teal-100"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-300"
          }`}
        >
          US
        </button>
        <button
          type="button"
          onClick={() => onChange("EU")}
          className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
            value === "EU"
              ? "border-teal-500/35 bg-teal-950/50 text-teal-100"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-300"
          }`}
        >
          Europe
        </button>
      </div>
    </div>
  );
}
