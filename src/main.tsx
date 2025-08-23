// src/main.tsx - CODE CORRIGÉ
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ⬇️ AJOUTER CETTE LIGNE POUR SENTRY
import './lib/monitoring.ts'

createRoot(document.getElementById("root")!).render(<App />);