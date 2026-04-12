import { ui } from "@/lib/ui-styles";

type Props = {
  draftText: string;
  setDraftText: (value: string) => void;
  contextText: string;
  setContextText: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

const field =
  "min-h-[200px] w-full rounded-lg border border-white/[0.08] bg-black/25 px-3.5 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-teal-500/25 focus:ring-1 focus:ring-teal-500/15";

const fieldShort =
  "min-h-[160px] w-full rounded-lg border border-white/[0.08] bg-black/25 px-3.5 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-teal-500/25 focus:ring-1 focus:ring-teal-500/15";

export default function UploadPanel({
  draftText,
  setDraftText,
  contextText,
  setContextText,
  onSubmit,
  loading,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className={ui.label}>Patent draft</label>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          className={field}
          placeholder="Paste patent draft text here..."
        />
      </div>

      <div className="space-y-1.5">
        <label className={ui.label}>Supporting context</label>
        <textarea
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          className={fieldShort}
          placeholder="Paste invention disclosure, notes, or background here..."
        />
      </div>

      <div className="pt-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !draftText.trim()}
          className="w-full rounded-lg border border-teal-600/35 bg-teal-950/40 px-4 py-3 text-sm font-semibold text-teal-100 transition-colors hover:border-teal-500/45 hover:bg-teal-950/55 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {loading ? "Reviewing…" : "Run review"}
        </button>
      </div>
    </div>
  );
}
