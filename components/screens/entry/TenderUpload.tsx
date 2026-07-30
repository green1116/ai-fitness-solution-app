/**
 * CMP-UPLOAD-TENDER — SCR-03 source zone.
 * Upload affordance only; does not parse or store tender content.
 */
export function TenderUpload() {
  return (
    <div data-cmp="CMP-UPLOAD-TENDER" data-int-id="INT-INTAKE-UPLOAD" data-action-id="ACT-03-01">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Tender source
      </p>
      <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-start justify-center border-b border-dashed border-slate-300 py-6">
        <span className="text-sm font-semibold text-slate-950">
          Upload tender document
        </span>
        <span className="mt-2 text-sm text-slate-600">
          Choose a file to start tender understanding
        </span>
        <input
          type="file"
          name="tenderSource"
          className="mt-4 text-sm text-slate-600"
          accept=".pdf,.doc,.docx"
        />
      </label>
    </div>
  );
}
