import React from 'react'
import { AnalysisResults } from '@/types/analysis'
import { Badge } from "@/components/ui/badge"

interface SymbolsAnalysisProps {
  results: AnalysisResults['symbols']
}

export function SymbolsAnalysis({ results }: SymbolsAnalysisProps) {
  if (!results) return null

  const { detectedSymbols, riskAnalysis, symbolOccurrences, symbolCategories } = results

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Symbols Analysis</h2>
      
      <h3 className="text-xl font-semibold mb-2">Detected Symbols</h3>
      <ul className="list-disc pl-5 mb-4">
        {detectedSymbols.map((symbol: { symbol: string; confidence: number; time: string; location: string }, index: number) => (
          <li key={index}>{symbol.time}: {symbol.symbol} ({symbol.confidence.toFixed(2)}) at {symbol.location}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Risk Analysis</h3>
      <div className="mb-4">
        <p><strong>Risk Level:</strong> {riskAnalysis.riskLevel}</p>
        <p><strong>Overall Risk:</strong> {riskAnalysis.overallRisk.toFixed(2)}</p>
        <p><strong>Risk Label:</strong> {riskAnalysis.riskLabel}</p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Symbol Occurrences</h3>
      <ul className="list-disc pl-5 mb-4">
        {Object.entries(symbolOccurrences).map(([symbol, count]) => (
          <li key={symbol}>{symbol}: {count}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Symbol Categories</h3>
      <div className="flex flex-wrap gap-2">
        {symbolCategories.map((category: string, index: number) => (
          <Badge key={index} variant="secondary">{category}</Badge>
        ))}
      </div>
    </div>
  )
}