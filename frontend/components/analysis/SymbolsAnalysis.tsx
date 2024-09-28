import React from 'react'
import { AnalysisResults } from '@/types/analysis'

export function SymbolsAnalysis({ results }: { results: AnalysisResults['symbols'] }) {
  if (!results) return null

  return (
    <div>
      <h2>Symbols Analysis</h2>
      <h3>Detected Symbols</h3>
      <ul>
        {results.detectedSymbols.map((symbol, index) => (
          <li key={index}>{symbol.symbol}: {symbol.confidence}</li>
        ))}
      </ul>
      <h3>Risk Analysis</h3>
      <p>Risk Level: {results.riskAnalysis.riskLevel}</p>
      <p>Overall Risk: {results.riskAnalysis.overallRisk}</p>
      <p>Risk Label: {results.riskAnalysis.riskLabel}</p>
      <h3>Symbol Occurrences</h3>
      <ul>
        {Object.entries(results.symbolOccurrences).map(([symbol, count]) => (
          <li key={symbol}>{symbol}: {count}</li>
        ))}
      </ul>
      <h3>Symbol Categories</h3>
      <ul>
        {results.symbolCategories.map((category, index) => (
          <li key={index}>{category}</li>
        ))}
      </ul>
      <h3>Labels</h3>
      <ul>
        {results.labels.map((label, index) => (
          <li key={index}>{label}</li>
        ))}
      </ul>
    </div>
  )
}