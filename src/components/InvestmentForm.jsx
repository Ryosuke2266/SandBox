import { useState } from 'react'
import './InvestmentForm.css'

const InvestmentForm = ({ onCalculate, onReset }) => {
  const [formData, setFormData] = useState({
    option1: { name: '', investment: '', savings: '', operating: '', safety: '' },
    option2: { name: '', investment: '', savings: '', operating: '', safety: '' },
    option3: { name: '', investment: '', savings: '', operating: '', safety: '' },
    years: 5
  })

  const handleInputChange = (option, field, value) => {
    setFormData(prev => ({
      ...prev,
      [option]: {
        ...prev[option],
        [field]: value
      }
    }))
  }

  const handleYearsChange = (value) => {
    setFormData(prev => ({
      ...prev,
      years: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const options = [
      {
        name: formData.option1.name,
        investment: parseFloat(formData.option1.investment),
        savings: parseFloat(formData.option1.savings),
        operating: parseFloat(formData.option1.operating),
        safety: formData.option1.safety
      },
      {
        name: formData.option2.name,
        investment: parseFloat(formData.option2.investment),
        savings: parseFloat(formData.option2.savings),
        operating: parseFloat(formData.option2.operating),
        safety: formData.option2.safety
      },
      {
        name: formData.option3.name,
        investment: parseFloat(formData.option3.investment),
        savings: parseFloat(formData.option3.savings),
        operating: parseFloat(formData.option3.operating),
        safety: formData.option3.safety
      }
    ]

    onCalculate({ options, years: parseInt(formData.years) })
  }

  const handleReset = () => {
    setFormData({
      option1: { name: '', investment: '', savings: '', operating: '', safety: '' },
      option2: { name: '', investment: '', savings: '', operating: '', safety: '' },
      option3: { name: '', investment: '', savings: '', operating: '', safety: '' },
      years: 5
    })
    onReset()
  }

  const renderOptionCard = (optionKey, optionNumber) => {
    const option = formData[optionKey]

    return (
      <div className="option-card" key={optionKey}>
        <h2>Option {optionNumber}</h2>

        <div className="form-group">
          <label htmlFor={`${optionKey}-name`}>Investment Name:</label>
          <input
            type="text"
            id={`${optionKey}-name`}
            value={option.name}
            onChange={(e) => handleInputChange(optionKey, 'name', e.target.value)}
            placeholder={`e.g., New Equipment ${String.fromCharCode(64 + optionNumber)}`}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${optionKey}-investment`}>Initial Investment ($):</label>
          <input
            type="number"
            id={`${optionKey}-investment`}
            value={option.investment}
            onChange={(e) => handleInputChange(optionKey, 'investment', e.target.value)}
            min="0"
            step="0.01"
            placeholder="100000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${optionKey}-savings`}>Annual Savings/Benefits ($):</label>
          <input
            type="number"
            id={`${optionKey}-savings`}
            value={option.savings}
            onChange={(e) => handleInputChange(optionKey, 'savings', e.target.value)}
            min="0"
            step="0.01"
            placeholder="30000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${optionKey}-operating`}>Annual Operating Costs ($):</label>
          <input
            type="number"
            id={`${optionKey}-operating`}
            value={option.operating}
            onChange={(e) => handleInputChange(optionKey, 'operating', e.target.value)}
            min="0"
            step="0.01"
            placeholder="5000"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${optionKey}-safety`}>Safety/Quality Impact:</label>
          <select
            id={`${optionKey}-safety`}
            value={option.safety}
            onChange={(e) => handleInputChange(optionKey, 'safety', e.target.value)}
            required
          >
            <option value="">Select impact level</option>
            <option value="high">High - Significant improvement</option>
            <option value="medium">Medium - Moderate improvement</option>
            <option value="low">Low - Minimal improvement</option>
          </select>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="investment-form">
      <div className="options-container">
        {renderOptionCard('option1', 1)}
        {renderOptionCard('option2', 2)}
        {renderOptionCard('option3', 3)}
      </div>

      <div className="analysis-period">
        <label htmlFor="years">Analysis Period (Years):</label>
        <input
          type="number"
          id="years"
          value={formData.years}
          onChange={(e) => handleYearsChange(e.target.value)}
          min="1"
          max="30"
          required
        />
      </div>

      <div className="button-container">
        <button type="submit" className="btn-primary">
          Calculate & Compare
        </button>
        <button type="button" onClick={handleReset} className="btn-secondary">
          Reset
        </button>
      </div>
    </form>
  )
}

export default InvestmentForm
