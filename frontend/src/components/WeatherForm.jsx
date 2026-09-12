import { useState } from "react";

const initialForm = {
  latitude: "",
  longitude: "",
  start_date: "",
  end_date: "",
};

function validateForm(form) {
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);

  if (
    form.latitude === "" ||
    Number.isNaN(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return "Latitude must be between -90 and 90.";
  }

  if (
    form.longitude === "" ||
    Number.isNaN(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return "Longitude must be between -180 and 180.";
  }

  if (!form.start_date || !form.end_date) {
    return "Start date and end date are required.";
  }

  const start = new Date(`${form.start_date}T00:00:00Z`);
  const end = new Date(`${form.end_date}T00:00:00Z`);

  if (start > end) {
    return "Start date must be before or equal to end date.";
  }

  const totalDays =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays > 31) {
    return "Date range cannot exceed 31 days.";
  }

  return "";
}

function WeatherForm({
  onSubmit,
  loading,
  successFile,
   onClearSuccess,
}) {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationError("");
      if (onClearSuccess) {
    onClearSuccess();
  }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateForm(form);

    if (error) {
      setValidationError(error);
      return;
    }

    await onSubmit({
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      start_date: form.start_date,
      end_date: form.end_date,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
          Step 1
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Fetch historical weather
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select coordinates and a date range of up to 31 days.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-4 sm:grid-cols-2"
      >
        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Latitude
          </span>

          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="22.5726"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Longitude
          </span>

          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="88.3639"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Start Date
          </span>

          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            End Date
          </span>

          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <div className="sm:col-span-2">
          {validationError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError}
            </div>
          )}

          {successFile && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Stored successfully:
              <span className="ml-1 break-all font-semibold">
                {successFile}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Fetching & storing..."
              : "Fetch & Store Data"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default WeatherForm;