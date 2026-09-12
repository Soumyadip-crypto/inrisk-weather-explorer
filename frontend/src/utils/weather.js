export function createWeatherRows(weatherData) {
  const daily = weatherData?.daily;

  if (!daily?.time || !Array.isArray(daily.time)) {
    return [];
  }

  return daily.time.map((date, index) => ({
    date,

    maxTemperature:
      daily.temperature_2m_max?.[index] ?? null,

    minTemperature:
      daily.temperature_2m_min?.[index] ?? null,

    apparentMax:
      daily.apparent_temperature_max?.[index] ?? null,

    apparentMin:
      daily.apparent_temperature_min?.[index] ?? null,
  }));
}

export function formatBytes(bytes) {
  if (!bytes) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}