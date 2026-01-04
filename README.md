# Islamic Website Backend

A comprehensive backend API for Islamic website functionality, providing local alternatives to external Islamic APIs.

## Features

- 🕌 **Prayer Times Calculation** - Accurate prayer times using Adhan library
- 🧭 **Qibla Direction** - Calculate Qibla direction from any location
- 📍 **Geocoding** - Location search with fallback to mock data
- 📅 **Hijri Date Conversion** - Convert between Gregorian and Hijri dates
- 🌐 **CORS Support** - Ready for frontend integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Prayer Times API
- `GET /api/prayer-times/:date?latitude=:lat&longitude=:lon&method=:method` - Get prayer times

### Qibla API
- `GET /api/qibla?latitude=:lat&longitude=:lon` - Get Qibla direction

### Geocoding API
- `GET /api/geocode?q=:query` - Search for locations

### Hijri Date API
- `GET /api/hijri-date?date=:date` - Convert dates

### Health Check
- `GET /api/health` - Server health status

## Usage Examples

### Get Prayer Times
```javascript
fetch('/api/prayer-times/2024-01-15?latitude=21.4225&longitude=39.8262')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Calculate Qibla
```javascript
fetch('/api/qibla?latitude=40.7128&longitude=-74.0060')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Dependencies

- **express** - Web framework
- **adhan** - Islamic prayer times calculation
- **node-geocoder** - Geocoding services
- **moment-hijri** - Hijri date conversion
- **cors** - Cross-origin resource sharing

## Configuration

The server runs on port 3001 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Integration with Frontend

Update your frontend JavaScript files to use local API endpoints instead of external APIs:

```javascript
// Instead of: https://api.aladhan.com/v1/timings
// Use: /api/prayer-times

// Instead of: https://nominatim.openstreetmap.org/search
// Use: /api/geocode
```

## Development

The backend provides the same API structure as popular Islamic APIs, making it easy to switch between local and external services.

## License

MIT License - feel free to use in your Islamic applications.