import './ComparisonResults.css'

const ComparisonResults = ({ results }) => {
  const { options, bestROI, bestPayback, winner, runnerUp, years } = results

  const formatCurrency = (value) => {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatPercent = (value) => {
    return value.toFixed(2) + '%'
  }

  const formatYears = (value) => {
    return value.toFixed(2) + ' years'
  }

  const getSafetyBadgeClass = (safety) => {
    return `safety-badge safety-${safety}`
  }

  const getSafetyText = (safety) => {
    const texts = {
      high: 'High Impact',
      medium: 'Medium Impact',
      low: 'Low Impact'
    }
    return texts[safety]
  }

  const renderRow = (label, values, highlights = []) => {
    return (
      <tr key={label}>
        <td className="metric-label">{label}</td>
        {values.map((value, index) => (
          <td key={index} className={highlights[index] ? 'best-value' : ''}>
            {value}
          </td>
        ))}
      </tr>
    )
  }

  return (
    <div className="results">
      <h2>📊 Comparison Results</h2>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>{options[0].name}</th>
            <th>{options[1].name}</th>
            <th>{options[2].name}</th>
          </tr>
        </thead>
        <tbody>
          {renderRow(
            'Initial Investment',
            options.map(o => formatCurrency(o.investment))
          )}
          {renderRow(
            'Annual Savings',
            options.map(o => formatCurrency(o.savings))
          )}
          {renderRow(
            'Annual Operating Costs',
            options.map(o => formatCurrency(o.operating))
          )}
          {renderRow(
            'Net Annual Benefit',
            options.map(o => formatCurrency(o.netAnnualBenefit))
          )}
          {renderRow(
            'Return on Investment (ROI)',
            options.map(o => formatPercent(o.roi)),
            options.map(o => o.roi === bestROI)
          )}
          {renderRow(
            'Payback Period',
            options.map(o => formatYears(o.paybackPeriod)),
            options.map(o => o.paybackPeriod === bestPayback)
          )}
          {renderRow(
            `Total Profit (${years} years)`,
            options.map(o => formatCurrency(o.totalProfit))
          )}
          <tr>
            <td className="metric-label">Safety/Quality Impact</td>
            {options.map((option, index) => (
              <td key={index}>
                <span className={getSafetyBadgeClass(option.safety)}>
                  {getSafetyText(option.safety)}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="recommendation">
        <h3>🏆 Recommended Investment: {winner.name}</h3>
        <p><strong>Score: {winner.score}/100</strong></p>
        <p>
          This option is recommended because it offers{' '}
          {winner.reasons.length > 0
            ? winner.reasons.join(', ') + '. '
            : 'the best overall balance of financial returns and benefits. '}
          With an ROI of {formatPercent(options[winner.index].roi)} and a
          payback period of {formatYears(options[winner.index].paybackPeriod)},
          this investment provides strong financial performance
          {options[winner.index].safety === 'high' &&
            ' along with significant safety and quality improvements'}
          .
        </p>
        {runnerUp && (
          <p className="runner-up">
            <strong>Note:</strong> {runnerUp.name} is also a strong alternative
            with a score of {runnerUp.score}/100.
          </p>
        )}
      </div>
    </div>
  )
}

export default ComparisonResults
