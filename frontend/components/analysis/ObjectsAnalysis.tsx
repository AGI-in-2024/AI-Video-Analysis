import React from 'react'
import { AnalysisResults } from '@/types/analysis'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface ObjectsAnalysisProps {
  results: AnalysisResults['objects']
}

export function ObjectsAnalysis({ results }: ObjectsAnalysisProps) {
  if (!results) return null

  const { objectCategories, keyObjects, objectOccurrences, objectInteractions } = results

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Objects Analysis</h2>
      
      <h3 className="text-xl font-semibold mb-2">Object Categories</h3>
      <ul className="list-disc pl-5 mb-4">
        {objectCategories.map((category: string, index: number) => (
          <li key={index}>{category}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Key Objects</h3>
      <ul className="list-disc pl-5 mb-4">
        {keyObjects.map((object: { time: string; description: string }, index: number) => (
          <li key={index}>{object.time}: {object.description}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Object Occurrences</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={Object.entries(objectOccurrences).map(([name, count]) => ({ name, count }))}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-semibold mt-4 mb-2">Object Interactions</h3>
      <ul className="list-disc pl-5">
        {objectInteractions.map((interaction: { time: string; description: string }, index: number) => (
          <li key={index}>{interaction.time}: {interaction.description}</li>
        ))}
      </ul>
    </div>
  )
}