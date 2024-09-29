import React from 'react';

interface SymbolsOverlayProps {
  symbols: Array<{ symbol: string; confidence: number; time: string; location: string }>;
  currentTime: number;
}

export function SymbolsOverlay({ symbols, currentTime }: SymbolsOverlayProps) {
  const currentSymbols = symbols.filter(sym => parseFloat(sym.time) <= currentTime);
  
  return (
    <div className="absolute top-0 left-0 right-0 flex flex-wrap">
      {currentSymbols.map((sym, index) => (
        <div key={index} className="bg-green-500 bg-opacity-50 text-white m-1 p-1 rounded">
          {sym.symbol} ({sym.confidence.toFixed(2)})
        </div>
      ))}
    </div>
  );
}