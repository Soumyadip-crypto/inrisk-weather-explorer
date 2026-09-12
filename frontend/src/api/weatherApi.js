const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const validationErrors = data?.errors
      ?.map((error) => `${error.field}: ${error.message}`)
      .join(" | ");

    const message =
      validationErrors ||
      data?.message ||
      data?.detail ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export function storeWeatherData(payload) {
  return request("/store-weather-data", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listWeatherFiles() {
  return request("/list-weather-files");
}

export function getWeatherFileContent(fileName) {
  return request(
    `/weather-file-content/${encodeURIComponent(fileName)}`
  );
}