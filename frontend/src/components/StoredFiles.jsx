import {
  formatBytes,
  formatDateTime,
} from "../utils/weather";

function StoredFiles({
  files,
  loading,
  selectedFile,
  onRefresh,
  onSelect,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Step 2
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Stored files
          </h2>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Browse Files"}
        </button>
      </div>

      {files.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium text-slate-700">
            No stored files loaded
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Store weather data or browse your cloud bucket.
          </p>
        </div>
      ) : (
        <div className="max-h-[430px] divide-y divide-slate-100 overflow-y-auto">
          {files.map((file) => {
            const active = selectedFile === file.name;

            return (
              <button
                key={file.name}
                type="button"
                onClick={() => onSelect(file.name)}
                className={`block w-full px-6 py-4 text-left transition ${
                  active
                    ? "bg-sky-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="break-all text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>

                  {active && (
                    <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700">
                      OPEN
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>{formatBytes(file.size)}</span>

                  <span>
                    {formatDateTime(file.created_at)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StoredFiles;