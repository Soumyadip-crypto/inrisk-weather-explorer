# Weather Explorer

A full-stack weather data application built for the InRisk Labs case study.

The application allows users to fetch historical weather data for a geographic location and date range, store the raw Open-Meteo response in Amazon S3, browse previously stored datasets, and visualize the stored data using charts and a paginated table.

---

## Features

- Fetch historical weather data using latitude and longitude
- Select a custom date range of up to 31 days
- Frontend and backend input validation
- Historical weather data powered by Open-Meteo
- Raw API responses stored in Amazon S3
- Browse previously stored weather files
- Load data directly from stored cloud JSON
- Maximum and minimum temperature line chart
- Daily weather data table
- Pagination with 10, 20, or 50 rows per page
- Client-side caching to avoid unnecessary repeated API calls
- Loading, success, empty, and error states
- Responsive UI

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- JavaScript

### Backend

- Python
- FastAPI
- Pydantic
- HTTPX
- Boto3

### Cloud / External Services

- Amazon S3
- Open-Meteo Historical Weather API

### Testing

- Pytest
- FastAPI TestClient

---

## Architecture

```text
                         ┌──────────────────────┐
                         │      React UI        │
                         │ Vite + Tailwind CSS  │
                         │      Recharts        │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │    FastAPI Backend   │
                         └───────┬───────┬──────┘
                                 │       │
                    Fetch data   │       │ Store / Read
                                 │       │
                                 ▼       ▼
                     ┌──────────────┐  ┌──────────────┐
                     │  Open-Meteo  │  │  Amazon S3   │
                     │ Archive API  │  │Object Storage│
                     └──────────────┘  └──────────────┘
```

The backend fetches historical weather information from Open-Meteo and preserves the raw JSON response in Amazon S3.

Charts and tables are rendered from the stored S3 JSON instead of repeatedly calling Open-Meteo.

---

## API Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

---

### Store Weather Data

```http
POST /store-weather-data
```

Example request:

```json
{
  "latitude": 22.5726,
  "longitude": 88.3639,
  "start_date": "2026-07-01",
  "end_date": "2026-07-31"
}
```

Example response:

```json
{
  "status": "ok",
  "file": "weather_22.5726_88.3639_2026-07-01_2026-07-31_<timestamp>.json"
}
```

---

### List Stored Weather Files

```http
GET /list-weather-files
```

Example response:

```json
{
  "files": [
    {
      "name": "weather_22.5726_88.3639_2026-07-01_2026-07-31_<timestamp>.json",
      "size": 1400,
      "created_at": "2026-09-12T17:31:26+00:00"
    }
  ]
}
```

---

### Read Stored Weather File

```http
GET /weather-file-content/{file_name}
```

Returns the original weather JSON stored in Amazon S3.

If the object does not exist:

```json
{
  "status": "error",
  "message": "not found"
}
```

---

## Validation

The application validates requests on both the frontend and backend.

Rules:

- Latitude must be between `-90` and `90`
- Longitude must be between `-180` and `180`
- Start date and end date are required
- Start date must be before or equal to end date
- Date ranges cannot exceed 31 inclusive days

Backend validation prevents invalid requests even if frontend validation is bypassed.

---

## Weather Data

The following daily Open-Meteo fields are requested:

- `temperature_2m_max`
- `temperature_2m_min`
- `apparent_temperature_max`
- `apparent_temperature_min`

The raw Open-Meteo JSON response is stored without transforming the stored representation.

---

## S3 File Naming

Stored objects use the following convention:

```text
weather_<latitude>_<longitude>_<start_date>_<end_date>_<timestamp>.json
```

Example:

```text
weather_22.5726_88.3639_2026-07-01_2026-07-31_20260912T173125686909Z.json
```

A UTC timestamp makes each object name unique.

---

## Project Structure

```text
inrisk-weather-explorer/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   └── models.py
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── requirements.txt
│   └── requirements-dev.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Local Development

## 1. Clone the Repository

```bash
git clone <repository-url>
cd inrisk-weather-explorer
```

---

## 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows PowerShell

```powershell
venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements-dev.txt
```

Create a `.env` file inside the `backend` directory.

Example:

```env
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
CORS_ORIGINS=http://localhost:5173
OPEN_METEO_BASE_URL=https://archive-api.open-meteo.com/v1/archive
REQUEST_TIMEOUT_SECONDS=20
```

Run the backend:

```bash
python -m uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

Health endpoint:

```text
http://127.0.0.1:8000/health
```

---

## 3. Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory.

Add:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Running Tests

Move into the backend directory:

```bash
cd backend
```

Run:

```bash
python -m pytest
```

Current result:

```text
8 passed
```

The test suite covers API behavior and request-model validation.

---

## Frontend Quality Checks

Move into the frontend directory:

```bash
cd frontend
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The project currently passes ESLint and creates a successful Vite production build.

---

## Data Flow

The main application flow is:

```text
User enters coordinates and date range
            ↓
React frontend validates the input
            ↓
POST /store-weather-data
            ↓
FastAPI validates the request
            ↓
FastAPI calls Open-Meteo
            ↓
Raw Open-Meteo JSON is stored in Amazon S3
            ↓
Backend returns the generated file name
            ↓
Frontend refreshes the stored file list
            ↓
Frontend loads the stored S3 JSON
            ↓
Chart and table are rendered
```

---

## Error Handling

The application handles:

- Invalid latitude
- Invalid longitude
- Missing dates
- Start date greater than end date
- Date ranges greater than 31 days
- Open-Meteo request failures
- S3 upload failures
- S3 list failures
- Missing stored files
- Invalid stored JSON
- Frontend API failures

The UI provides visible error, loading, empty, and success states.

---

## Performance

The frontend keeps previously loaded weather files in an in-memory cache using a JavaScript `Map`.

If the user opens the same stored file again, the application can reuse the cached data instead of making another backend request.

This helps avoid unnecessary API calls.

---

## Security

Environment files are excluded from source control.

The following files and directories are ignored:

```text
backend/.env
frontend/.env
backend/venv/
frontend/node_modules/
frontend/dist/
```

AWS credentials must never be committed to Git.

For local development, credentials can be supplied through environment variables.

For AWS-hosted backend environments, an IAM execution role should be preferred instead of long-lived AWS access keys.

The Amazon S3 bucket is private and public access is blocked.

---

## AWS S3 Permissions

The application follows a least-privilege approach.

The backend only requires the following S3 permissions:

```text
s3:ListBucket
s3:GetObject
s3:PutObject
```

These permissions are limited to the Weather Explorer S3 bucket.

---

## Design Decisions

### Raw JSON Storage

The original Open-Meteo response is stored directly in Amazon S3.

This preserves the original upstream response and avoids modifying the persisted dataset.

### Stored Data for Visualization

The frontend charts and tables use stored weather JSON rather than repeatedly calling Open-Meteo.

This clearly separates data collection from data visualization.

### Client-Side File Cache

Previously opened weather files are cached in memory using a `Map`.

This avoids unnecessary repeated requests when a user selects the same file multiple times.

### S3 Pagination

The backend uses the Amazon S3 paginator when listing stored objects.

This allows the application to continue working correctly even when the number of stored files grows beyond a single S3 response.

### Unique File Names

A UTC timestamp is included in every generated object name.

This prevents files with the same coordinates and date range from overwriting each other.

### Backend Validation

Validation is implemented on the backend in addition to frontend validation.

This prevents invalid requests from being accepted when the frontend is bypassed.

---

## Deployment

Production deployment URLs will be added after deployment.

### Frontend

```text
Coming soon
```

### Backend API

```text
Coming soon
```

---

## Future Improvements

Possible future enhancements include:

- Search and filtering for stored weather files
- Delete stored datasets
- Additional weather metrics
- Chart date-range zooming
- Automated CI/CD
- Automated cloud integration tests
- Authentication and user-specific datasets

---

## Author

Soumyadip Parui