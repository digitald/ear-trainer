# Ear Trainer App (React + Vite + Capacitor)

Nuova base applicativa smartphone-first per la riscrittura del progetto.

## Stack
- React + TypeScript + Vite
- Capacitor (Android)
- i18n IT/EN con `react-i18next`

## Avvio sviluppo (senza Android Studio)
```bash
npm install
npm run dev
```

## Build web
```bash
npm run build
npm run preview
```

## Sync Capacitor Android (solo terminale)
```bash
npx cap sync android
```

## Audio samples
La nuova app usa i campioni audio legacy dalla cartella repository `sounds/`
tramite configurazione Vite `publicDir: '../sounds'`.

## Quando servirà Android Studio
Android Studio è necessario solo per:
- avviare emulatori Android
- compilare APK/AAB native
- pubblicazione Play Store
