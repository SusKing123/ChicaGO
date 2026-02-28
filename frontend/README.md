# ChicaGO Mobile App

React Native mobile application for exploring Chicago locations.

## Getting Started

### Prerequisites
- Node.js and npm installed
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your backend API URL:
```
REACT_APP_API_URL=http://YOUR_BACKEND_URL/api
```

### Running the App

**Start the development server:**
```bash
npm start
```

**Run on iOS simulator:**
```bash
npm run ios
```

**Run on Android emulator:**
```bash
npm run android
```

**Run on web:**
```bash
npm run web
```

## Project Structure

```
frontend/
├── src/
│   ├── screens/       # Screen components
│   ├── components/    # Reusable components
│   ├── services/      # API and external services
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
├── assets/            # Images, fonts, etc.
├── App.tsx            # Main app component
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript configuration
```

## Available Scripts

- `npm start` - Start development server
- `npm run ios` - Run on iOS
- `npm run android` - Run on Android
- `npm run web` - Run web version
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## API Integration

The app connects to the Django backend at http://localhost:8000/api. Update the `REACT_APP_API_URL` in your `.env` file to point to your backend server.

## Technologies

- React Native
- Expo
- TypeScript
- React Navigation
- Axios
