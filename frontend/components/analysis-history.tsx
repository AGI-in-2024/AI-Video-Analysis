import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

interface AnalysisHistoryItem {
  id: string
  video_name: string
  analysis: any
}

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAnalysisHistory()
  }, [])

  const fetchAnalysisHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/get-analysis-history')
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Analysis history not found. The server might be misconfigured or the endpoint does not exist.')
        } else if (response.status === 403) {
          throw new Error('Access forbidden. You might not have the necessary permissions to view the analysis history.')
        } else if (response.status === 500) {
          throw new Error('Internal server error. Please try again later or contact support if the problem persists.')
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      const data = await response.json()
      if (!Array.isArray(data.history)) {
        throw new Error('Invalid data format received from server. Expected an array of analysis history items.')
      }
      setHistory(data.history)
    } catch (error) {
      console.error('Error fetching analysis history:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred while fetching the analysis history.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnalysis = (item: AnalysisHistoryItem) => {
    try {
      setSelectedAnalysis(item)
    } catch (error) {
      console.error('Error selecting analysis:', error)
      setError('Failed to display selected analysis. Please try again or contact support if the issue persists.')
    }
  }

  const renderErrorCard = () => (
    <Card className="bg-red-900 border-red-700">
      <CardHeader>
        <CardTitle className="text-red-100 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-100 mb-4">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAnalysisHistory} 
          className="bg-red-800 text-red-100 hover:bg-red-700"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </CardContent>
    </Card>
  )

  if (error) {
    return renderErrorCard()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Analysis History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-gray-400">Loading analysis history...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-400">No analysis history available. Try analyzing a video first.</div>
        ) : (
          <ScrollArea className="h-[300px]">
            {history.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full text-left mb-2 hover:bg-gray-700"
                onClick={() => handleSelectAnalysis(item)}
              >
                {item.video_name}
              </Button>
            ))}
          </ScrollArea>
        )}
        {selectedAnalysis && (
          <Card className="mt-4 bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-gray-100">{selectedAnalysis.video_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedAnalysis.analysis, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}