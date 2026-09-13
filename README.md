# Weather Explorer

A full-stack historical weather data application built for the InRisk Labs Full Stack Engineer case study.

Weather Explorer allows users to enter a geographic location and historical date range, fetch weather data from Open-Meteo, store the original JSON response in Amazon S3, browse previously stored datasets, and visualize the stored data using charts and a paginated table.

## Live Demo

- **Frontend:** https://inrisk-weather-explorer-gules.vercel.app
- **Backend API:** https://ve1mksac44.execute-api.ap-south-1.amazonaws.com/default
- **GitHub Repository:** https://github.com/Soumyadip-crypto/inrisk-weather-explorer

---

## Features

- Fetch historical weather data using latitude and longitude
- Select a historical date range of up to 31 inclusive days
- Frontend and backend input validation
- Historical weather data powered by Open-Meteo
- Raw API responses stored in private Amazon S3 object storage
- Browse previously stored weather datasets
- Read stored JSON instead of repeatedly calling Open-Meteo
- Maximum and minimum temperature line chart
- Daily weather data table
- Apparent maximum and minimum temperature display
- Pagination with 10, 20, or 50 rows per page
- Client-side caching for previously opened files
- Loading, success, empty, and error states
- Responsive interface
- Serverless backend deployed on AWS Lambda
- Public HTTPS API through Amazon API Gateway
- Production frontend hosted on Vercel

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- JavaScript
- Fetch API

### Backend

- Python
- FastAPI
- Pydantic
- HTTPX
- Boto3
- Mangum

### Cloud & Deployment

- AWS Lambda
- Amazon API Gateway
- Amazon S3
- AWS IAM
- Vercel

### External Service

- Open-Meteo Historical Weather API

### Testing

- Pytest
- FastAPI TestClient

---

## Production Architecture

```text
                       User
                         │
                         ▼
                React / Vite Frontend
                         │
                       Vercel
                         │
                      HTTPS
                         ▼
                Amazon API Gateway
                         │
                         ▼
                   AWS Lambda
                         │
                      Mangum
                         │
                         ▼
                      FastAPI
                      /     \
                     /       \
                    ▼         ▼
             Open-Meteo    Amazon S3
              Archive       Private
                API       Object Storage
```

The React frontend is deployed on Vercel.

Requests are sent to Amazon API Gateway, which invokes the FastAPI application running inside AWS Lambda. Mangum acts as the adapter between Lambda/API Gateway events and the FastAPI ASGI application.

For new weather requests, FastAPI calls Open-Meteo and stores the original JSON response in Amazon S3.

When a stored dataset is selected, the application reads the JSON from S3 and uses it to render charts and tables without calling Open-Meteo again.

---

## Application Data Flow

```text
User enters latitude, longitude and date range
                    ↓
React validates the input
                    ↓
POST /store-weather-data
                    ↓
Amazon API Gateway
                    ↓
AWS Lambda
                    ↓
Mangum
                    ↓
FastAPI validates the request
                    ↓
Open-Meteo historical API
                    ↓
Raw JSON response
                    ↓
Amazon S3
                    ↓
Backend returns generated filename
                    ↓
Frontend refreshes stored file list
                    ↓
Selected JSON is read from S3
                    ↓
React transforms daily data
                    ↓
Recharts + Paginated Table
```

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
  "start_date": "2026-08-20",
  "end_date": "2026-08-24"
}
```

Example response:

```json
{
  "status": "ok",
  "file": "weather_22.5726_88.3639_2026-08-20_2026-08-24_<timestamp>.json"
}
```

This endpoint:

1. Validates the input
2. Fetches historical weather data from Open-Meteo
3. Generates a unique filename
4. Stores the raw JSON response in Amazon S3
5. Returns the stored filename

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
      "name": "weather_22.5726_88.3639_2026-08-20_2026-08-24_<timestamp>.json",
      "size": 609,
      "created_at": "2026-09-12T21:26:28+00:00"
    }
  ]
}
```

The backend uses the Amazon S3 paginator when listing stored objects.

---

### Read Stored Weather File

```http
GET /weather-file-content/{file_name}
```

Returns the original weather JSON stored in Amazon S3.

If the object cannot be found:

```json
{
  "status": "error",
  "message": "not found"
}
```

---

## Validation

Validation is implemented on both the frontend and backend.

Rules:

- Latitude must be between `-90` and `90`
- Longitude must be between `-180` and `180`
- Start date and end date are required
- Start date must be before or equal to end date
- Date ranges cannot exceed 31 inclusive days

Frontend validation provides immediate feedback to the user.

Backend validation remains the source of truth and protects the API even when frontend validation is bypassed.

---

## Weather Data

The application requests the following daily Open-Meteo fields:

- `temperature_2m_max`
- `temperature_2m_min`
- `apparent_temperature_max`
- `apparent_temperature_min`

The original Open-Meteo JSON response is stored directly in Amazon S3.

This keeps the persisted dataset faithful to the upstream API response and allows the stored data to be reused later without another Open-Meteo request.

---

## S3 File Naming

Stored objects follow this format:

```text
weather_<latitude>_<longitude>_<start_date>_<end_date>_<timestamp>.json
```

Example:

```text
weather_22.5726_88.3639_2026-08-20_2026-08-24_20260912T212627683943Z.json
```

A UTC timestamp is included to prevent different requests for the same location and date range from overwriting each other.

---

## Project Structure

```text
inrisk-weather-explorer/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── services/
│   │   │   ├── open_meteo.py
│   │   │   └── storage.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   ├── main.py
│   │   └── models.py
│   │
│   ├── tests/
│   │   ├── test_api.py
│   │   └── test_models.py
│   │
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── requirements.txt
│   └── requirements-dev.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── weatherApi.js
│   │   ├── components/
│   │   │   ├── StoredFiles.jsx
│   │   │   ├── TemperatureChart.jsx
│   │   │   ├── WeatherForm.jsx
│   │   │   └── WeatherTable.jsx
│   │   ├── utils/
│   │   │   └── weather.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Soumyadip-crypto/inrisk-weather-explorer.git
cd inrisk-weather-explorer
```

---

## Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows PowerShell

Activate it:

```powershell
venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements-dev.txt
```

Create:

```text
backend/.env
```

Example:

```env
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
CORS_ORIGINS=http://localhost:5173
OPEN_METEO_BASE_URL=https://archive-api.open-meteo.com/v1/archive
REQUEST_TIMEOUT_SECONDS=20
API_GATEWAY_BASE_PATH=/
```

Run the backend:

```bash
python -m uvicorn app.main:app --reload
```

Local backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Running Backend Tests

From the backend directory:

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

From the frontend directory:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The project passes ESLint and successfully creates a Vite production build.

---

## Frontend Components

### WeatherForm

Handles:

- Latitude input
- Longitude input
- Start date
- End date
- Client-side validation
- Submit state
- Success and validation messages

### StoredFiles

Displays stored S3 datasets and allows users to load an existing weather file.

The **Browse Files** button refreshes the S3 file list through:

```http
GET /list-weather-files
```

### TemperatureChart

Uses Recharts to display:

- Maximum daily temperature
- Minimum daily temperature

### WeatherTable

Displays:

- Date
- Maximum temperature
- Minimum temperature
- Apparent maximum temperature
- Apparent minimum temperature

Pagination supports:

```text
10
20
50
```

rows per page.

---

## Client-Side Caching

Previously opened weather files are stored in an in-memory JavaScript `Map`.

If a user opens the same stored file again, the frontend reuses the cached response rather than making another backend request.

This reduces unnecessary API calls.

---

## Error Handling

The application handles:

- Invalid latitude
- Invalid longitude
- Missing dates
- Start date greater than end date
- Date ranges longer than 31 days
- Open-Meteo request failures
- S3 upload failures
- S3 list failures
- Missing stored files
- Invalid stored JSON
- API request failures
- Loading states
- Empty states

---

## AWS Architecture

### AWS Lambda

The FastAPI backend runs serverlessly inside AWS Lambda.

Mangum converts API Gateway events into ASGI requests that FastAPI can process.

Lambda handler:

```text
app.main.handler
```

### Amazon API Gateway

API Gateway provides the public HTTPS endpoint for the Lambda backend.

A proxy route forwards application paths to the FastAPI Lambda function.

Production API base URL:

```text
https://ve1mksac44.execute-api.ap-south-1.amazonaws.com/default
```

### Amazon S3

Amazon S3 stores the raw historical weather JSON.

The bucket is private and public access is blocked.

The frontend never accesses S3 directly.

### AWS IAM

The Lambda function uses an IAM execution role instead of long-lived production AWS credentials.

The storage policy follows a least-privilege approach.

Required permissions:

```text
s3:ListBucket
s3:GetObject
s3:PutObject
```

These permissions are limited to the Weather Explorer S3 bucket.

---

## CORS

The production frontend and backend are hosted on different origins.

Frontend:

```text
https://inrisk-weather-explorer-gules.vercel.app
```

Backend:

```text
https://ve1mksac44.execute-api.ap-south-1.amazonaws.com
```

API Gateway CORS is configured for:

```text
Allowed origins:
https://inrisk-weather-explorer-gules.vercel.app
http://localhost:5173

Allowed methods:
GET
POST
OPTIONS

Allowed headers:
content-type
```

This allows both the deployed Vercel frontend and the local development frontend to communicate with the API.

---

## Security

Environment files and generated deployment artifacts are excluded from Git.

Examples:

```text
backend/.env
frontend/.env
backend/venv/
frontend/node_modules/
frontend/dist/
backend/lambda_package/
backend/lambda_deployment.zip
```

AWS credentials must never be committed to the repository.

For local development, AWS credentials can be supplied through environment variables.

In production, the Lambda function uses an IAM execution role with temporary AWS credentials.

The Amazon S3 bucket remains private.

---

## Key Design Decisions

### Raw JSON Storage

The original Open-Meteo response is stored directly in Amazon S3 instead of converting it into another storage format.

This preserves the upstream response and keeps the storage layer simple.

### Stored Data for Visualization

Charts and tables are rendered from stored S3 datasets instead of repeatedly requesting the same historical data from Open-Meteo.

This separates data collection from visualization.

### Serverless Backend

FastAPI is deployed using AWS Lambda and API Gateway rather than maintaining a continuously running server.

This reduces infrastructure management for the current workload.

### Client-Side File Cache

Previously opened files are cached using a JavaScript `Map`.

This avoids unnecessary repeated backend requests.

### S3 Pagination

The backend uses the S3 paginator for object listing rather than assuming all stored files will fit into one response.

### Unique Object Names

UTC timestamps make each S3 object name unique.

### Backend Validation

Backend validation protects the application even when frontend validation is bypassed.

### Least-Privilege IAM

The Lambda execution role only receives the S3 actions required by the application.

---

## Deployment

The application is fully deployed.

### Frontend

Hosted on Vercel:

```text
https://inrisk-weather-explorer-gules.vercel.app
```

### Backend API

FastAPI deployed on AWS Lambda behind Amazon API Gateway:

```text
https://ve1mksac44.execute-api.ap-south-1.amazonaws.com/default
```

### GitHub Repository

```text
https://github.com/Soumyadip-crypto/inrisk-weather-explorer
```

---

## Future Improvements

Possible future enhancements include:

- Search and filtering for stored weather files
- Server-side pagination for very large file collections
- Delete stored datasets
- Additional weather metrics
- Chart zooming and richer visualizations
- Authentication
- User-specific datasets
- CloudWatch alarms and structured monitoring
- Automated CI/CD
- Infrastructure as Code using AWS SAM or Terraform
- Automated cloud integration tests

---

## Author

**Soumyadip Parui**

GitHub: https://github.com/Soumyadip-crypto