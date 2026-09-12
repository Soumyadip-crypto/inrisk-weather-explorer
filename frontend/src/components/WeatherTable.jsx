import {
  useMemo,
  useState,
} from "react";

const PAGE_SIZES = [10, 20, 50];

function WeatherTable({
  rows,
  units = {},
}) {
  const [pageSize, setPageSize] =
    useState(10);

  const [page, setPage] =
    useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / pageSize)
  );

  // Safety: page কখনো totalPages-এর
  // বাইরে যেতে পারবে না
  const currentPage = Math.min(
    page,
    totalPages
  );

  const visibleRows = useMemo(() => {
    const start =
      (currentPage - 1) * pageSize;

    return rows.slice(
      start,
      start + pageSize
    );
  }, [
    rows,
    currentPage,
    pageSize,
  ]);

  const temperatureUnit =
    units.temperature_2m_max || "°C";

  function handlePageSizeChange(event) {
    const newPageSize =
      Number(event.target.value);

    setPageSize(newPageSize);

    // page size change হলে আবার
    // first page থেকে শুরু হবে
    setPage(1);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Daily weather data
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {rows.length} total rows
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          Rows per page

          <select
            value={pageSize}
            onChange={
              handlePageSizeChange
            }
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            {PAGE_SIZES.map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">
                Date
              </th>

              <th className="px-6 py-3">
                Max Temp
              </th>

              <th className="px-6 py-3">
                Min Temp
              </th>

              <th className="px-6 py-3">
                Apparent Max
              </th>

              <th className="px-6 py-3">
                Apparent Min
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((row) => (
              <tr
                key={row.date}
                className="hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-6 py-3 font-medium">
                  {row.date}
                </td>

                <td className="px-6 py-3">
                  {row.maxTemperature ??
                    "—"}

                  {row.maxTemperature !=
                    null &&
                    temperatureUnit}
                </td>

                <td className="px-6 py-3">
                  {row.minTemperature ??
                    "—"}

                  {row.minTemperature !=
                    null &&
                    temperatureUnit}
                </td>

                <td className="px-6 py-3">
                  {row.apparentMax ??
                    "—"}

                  {row.apparentMax !=
                    null &&
                    temperatureUnit}
                </td>

                <td className="px-6 py-3">
                  {row.apparentMin ??
                    "—"}

                  {row.apparentMin !=
                    null &&
                    temperatureUnit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
        <span className="text-sm text-slate-500">
          Page {currentPage} of{" "}
          {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={
              currentPage === 1
            }
            onClick={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1
                )
              )
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default WeatherTable;