import React from 'react'
import { AnalysisResults } from '@/types/analysis'

export function ObjectsAnalysis({ results }: { results: AnalysisResults['objects'] }) {
  if (!results) return null

  return (
    <div>
      <h2>Objects Analysis</h2>
      <h3>Object Categories</h3>
      <ul>
        {results.objectCategories.map((category, index) => (
          <li key={index}>{category}</li>
        ))}
      </ul>
      <h3>Key Objects</h3>
      <ul>
        {results.keyObjects.map((object, index) => (
          <li key={index}>{object.time}: {object.description}</li>
        ))}
      </ul>
      <h3>Object Occurrences</h3>
      <ul>
        {Object.entries(results.objectOccurrences).map(([object, count]) => (
          <li key={object}>{object}: {count}</li>
        ))}
      </ul>
      <h3>Object Interactions</h3>
      <ul>
        {results.objectInteractions.map((interaction, index) => (
          <li key={index}>{interaction.time}: {interaction.description}</li>
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