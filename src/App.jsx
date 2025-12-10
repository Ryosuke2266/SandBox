import { useState } from 'react'
import InvestmentForm from './components/InvestmentForm'
import ComparisonResults from './components/ComparisonResults'
import ExportButtons from './components/ExportButtons'
import './App.css'

function App() {
  const [results, setResults] = useState(null)
  const [options, setOptions] = useState(null)
  const [analysisYears, setAnalysisYears] = useState(5)

  const calculateInvestments = (formData) => {
    const { options: optionsData, years } = formData
    setAnalysisYears(years)

    const calculatedOptions = optionsData.map((option) => {
      const netAnnualBenefit = option.savings - option.operating
      const totalBenefit = netAnnualBenefit * years
      const totalProfit = totalBenefit - option.investment
      const roi = (totalProfit / option.investment) * 100
      const paybackPeriod = option.investment / netAnnualBenefit

      return {
        ...option,
        netAnnualBenefit,
        totalBenefit,
        totalProfit,
        roi,
        paybackPeriod
      }
    })

    setOptions(calculatedOptions)

    // Find best values
    const bestROI = Math.max(...calculatedOptions.map(o => o.roi))
    const bestPayback = Math.min(...calculatedOptions.map(o => o.paybackPeriod))

    // Calculate scores for recommendation
    const scores = calculatedOptions.map((option, index) => {
      let score = 0
      let reasons = []

      // ROI score (40%)
      if (option.roi === bestROI) {
        score += 40
        reasons.push('highest ROI')
      } else if (option.roi >= bestROI * 0.8) {
        score += 30
      }

      // Payback period score (40%)
      if (option.paybackPeriod === bestPayback) {
        score += 40
        reasons.push('shortest payback period')
      } else if (option.paybackPeriod <= bestPayback * 1.2) {
        score += 30
      }

      // Safety score (20%)
      const safetyScores = { 'high': 20, 'medium': 12, 'low': 5 }
      score += safetyScores[option.safety]
      if (option.safety === 'high') {
        reasons.push('high safety/quality impact')
      }

      return { index, score, reasons, name: option.name }
    })

    scores.sort((a, b) => b.score - a.score)
    const winner = scores[0]
    const runnerUp = scores[1].score >= winner.score * 0.9 ? scores[1] : null

    setResults({
      options: calculatedOptions,
      bestROI,
      bestPayback,
      winner,
      runnerUp,
      years
    })
  }

  const resetForm = () => {
    setResults(null)
    setOptions(null)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>💼 Capital Investment Comparison Tool</h1>
          <p className="subtitle">
            Compare up to 3 investment options using ROI and Payback Period analysis
          </p>
        </header>

        <InvestmentForm onCalculate={calculateInvestments} onReset={resetForm} />

        {results && (
          <>
            <ComparisonResults results={results} />
            <ExportButtons results={results} analysisYears={analysisYears} />
          </>
        )}
      </div>
    </div>
  )
}

export default App
