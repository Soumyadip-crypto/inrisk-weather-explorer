import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getWeatherFileContent,
  listWeatherFiles,
  storeWeatherData,
} from "./api/weatherApi";

import WeatherForm from "./components/WeatherForm";
import StoredFiles from "./components/StoredFiles";
import TemperatureChart from "./components/TemperatureChart";
import WeatherTable from "./components/WeatherTable";

import {
  createWeatherRows,
} from "./utils/weather";

function App() {
  const [files, setFiles] = useState([]);

  const [weatherData, setWeatherData] =
    useState(null);

  const [selectedFile, setSelectedFile] =
    useState("");

  const [successFile, setSuccessFile] =
    useState("");

  const [error, setError] =
    useState("");

  const [storeLoading, setStoreLoading] =
    useState(false);

  // true because initial file loading starts
  // immediately when App mounts
  const [filesLoading, setFilesLoading] =
    useState(true);

  const [
    contentLoading,
    setContentLoading,
  ] = useState(false);

  const fileCache = useRef(new Map());

  const rows =
    createWeatherRows(weatherData);

  const units =
    weatherData?.daily_units || {};

  async function loadFiles() {
    setFilesLoading(true);
    setError("");

    try {
      const data =
        await listWeatherFiles();

      setFiles(data.files || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setFilesLoading(false);
    }
  }

  async function loadFile(fileName) {
    setSelectedFile(fileName);
    setError("");

    if (
      fileCache.current.has(fileName)
    ) {
      setWeatherData(
        fileCache.current.get(fileName)
      );

      return;
    }

    setContentLoading(true);

    try {
      const data =
        await getWeatherFileContent(
          fileName
        );

      fileCache.current.set(
        fileName,
        data
      );

      setWeatherData(data);
    } catch (error) {
      setWeatherData(null);
      setError(error.message);
    } finally {
      setContentLoading(false);
    }
  }

  async function handleStore(payload) {
    setStoreLoading(true);
    setError("");
    setSuccessFile("");

    try {
      const result =
        await storeWeatherData(payload);

      setSuccessFile(result.file);

      await loadFiles();

      await loadFile(result.file);
    } catch (error) {
      setError(error.message);
    } finally {
      setStoreLoading(false);
    }
  }

  // Initial stored-file loading.
  // We intentionally do not call loadFiles()
  // here because loadFiles synchronously changes
  // state at the beginning of the effect.
  useEffect(() => {
    let cancelled = false;

    listWeatherFiles()
      .then((data) => {
        if (cancelled) return;

        setFiles(data.files || []);
        setError("");
      })
      .catch((error) => {
        if (cancelled) return;

        setError(error.message);
      })
      .finally(() => {
        if (cancelled) return;

        setFilesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
            InRisk Labs Case Study
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Weather Explorer
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Fetch historical weather from
            Open-Meteo, preserve the raw JSON
            in cloud object storage, and
            visualize stored datasets.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <WeatherForm
            onSubmit={handleStore}
            loading={storeLoading}
            successFile={successFile}
            onClearSuccess={() =>
              setSuccessFile("")
            }
          />

          <StoredFiles
            files={files}
            loading={filesLoading}
            selectedFile={selectedFile}
            onRefresh={loadFiles}
            onSelect={loadFile}
          />
        </div>

        <div className="mt-6">
          {contentLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              Loading stored weather data...
            </div>
          ) : rows.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  label="Latitude"
                  value={
                    weatherData?.latitude ??
                    "—"
                  }
                />

                <InfoCard
                  label="Longitude"
                  value={
                    weatherData?.longitude ??
                    "—"
                  }
                />

                <InfoCard
                  label="Stored Days"
                  value={rows.length}
                />

                <InfoCard
                  label="Timezone"
                  value={
                    weatherData?.timezone ||
                    "UTC"
                  }
                />
              </div>

              <TemperatureChart
                rows={rows}
                unit={
                  units.temperature_2m_max ||
                  "°C"
                }
              />

              <WeatherTable
                key={selectedFile}
                rows={rows}
                units={units}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-slate-700">
                No dataset selected
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Store new weather data or select
                an existing cloud file.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          Charts and tables are rendered from
          stored cloud JSON rather than calling
          Open-Meteo repeatedly.
        </div>
      </footer>
    </div>
  );
}

function InfoCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default App;