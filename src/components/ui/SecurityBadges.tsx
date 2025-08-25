// 🔒 1. BADGES SÉCURITÉ HEADER (15 minutes)
// Fichier à modifier : src/components/Header.tsx

// 📁 NOUVEAU COMPOSANT : src/components/ui/SecurityBadges.tsx
import React from 'react';
import { Shield, MapPin, Award } from 'lucide-react';

export const SecurityBadges: React.FC = () => {
  return (
    <div className="flex items-center gap-2 text-xs font-medium">
      {/* Badge Zero-Trust */}
      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">
        <Shield className="w-3 h-3" />
        <span>Zero-Trust</span>
      </div>

      {/* Badge Gouvernemental */}
      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200">
        <Award className="w-3 h-3" />
        <span>Gov-Ready</span>
      </div>

      {/* Badge Données Québec */}
      <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full border border-purple-200">
        <MapPin className="w-3 h-3" />
        <span>Données QC</span>
      </div>
    </div>
  );
};

// 🔧 MODIFICATION : src/components/Header.tsx
// Ajoutez ceci dans votre Header existant

import { SecurityBadges } from './ui/SecurityBadges';

// Dans votre composant Header, ajoutez les badges après le titre principal :
export const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo + Titre existant */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold">AgenticSST Québec™</h1>
                <p className="text-sm text-blue-100">Conformité LMRSST Intelligente</p>
              </div>
            </div>
            
            {/* 🔒 NOUVEAU : Badges sécurité */}
            <div className="hidden md:block">
              <SecurityBadges />
            </div>
          </div>

          {/* Navigation existante (gardez votre code actuel) */}
          <nav className="flex items-center space-x-6">
            {/* Vos liens de navigation actuels */}
            
            {/* Badges mobile (version compacte) */}
            <div className="md:hidden">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-300" />
                <Award className="w-4 h-4 text-blue-300" />
                <MapPin className="w-4 h-4 text-purple-300" />
              </div>
            </div>
          </nav>
          
        </div>
      </div>
    </header>
  );
};

// 💡 ALTERNATIVE SIMPLE (si vous préférez modifier moins de code)
// Ajoutez juste ceci APRÈS votre titre existant dans Header.tsx :

{/* Badges sécurité - Version inline simple */}
<div className="mt-2 flex items-center gap-2 text-xs">
  <span className="bg-green-500/20 text-green-100 px-2 py-1 rounded-full border border-green-400/30">
    🔒 Zero-Trust
  </span>
  <span className="bg-blue-500/20 text-blue-100 px-2 py-1 rounded-full border border-blue-400/30">
    🏛️ Gov-Ready
  </span>
  <span className="bg-purple-500/20 text-purple-100 px-2 py-1 rounded-full border border-purple-400/30">
    🇨🇦 Données QC
  </span>
</div>

// ✅ RÉSULTAT ATTENDU :
// Header avec 3 badges visibles :
// - 🔒 Zero-Trust (vert)
// - 🏛️ Gov-Ready (bleu) 
// - 🇨🇦 Données QC (violet)

// 🚀 TESTEZ IMMÉDIATEMENT :
// 1. Ajoutez le code dans Header.tsx
// 2. Sauvegardez (Ctrl+S)
// 3. Rechargez http://localhost:8080
// 4. Vérifiez que les badges apparaissent dans le header

// ⏰ TEMPS ESTIMÉ : 15 minutes
// 📈 IMPACT : Crédibilité immédiate visible