import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import './ExportButtons.css'

const ExportButtons = ({ results, analysisYears }) => {
  const { options, bestROI, bestPayback, winner } = results

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

  const getSafetyText = (safety) => {
    const texts = {
      high: 'High Impact',
      medium: 'Medium Impact',
      low: 'Low Impact'
    }
    return texts[safety]
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(20)
    doc.setTextColor(102, 126, 234)
    doc.text('Capital Investment Comparison Report', 14, 20)

    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Analysis Period: ${analysisYears} years`, 14, 34)

    // Comparison Table
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Investment Comparison', 14, 45)

    const tableData = [
      [
        'Initial Investment',
        formatCurrency(options[0].investment),
        formatCurrency(options[1].investment),
        formatCurrency(options[2].investment)
      ],
      [
        'Annual Savings',
        formatCurrency(options[0].savings),
        formatCurrency(options[1].savings),
        formatCurrency(options[2].savings)
      ],
      [
        'Annual Operating Costs',
        formatCurrency(options[0].operating),
        formatCurrency(options[1].operating),
        formatCurrency(options[2].operating)
      ],
      [
        'Net Annual Benefit',
        formatCurrency(options[0].netAnnualBenefit),
        formatCurrency(options[1].netAnnualBenefit),
        formatCurrency(options[2].netAnnualBenefit)
      ],
      [
        'ROI',
        formatPercent(options[0].roi) + (options[0].roi === bestROI ? ' *' : ''),
        formatPercent(options[1].roi) + (options[1].roi === bestROI ? ' *' : ''),
        formatPercent(options[2].roi) + (options[2].roi === bestROI ? ' *' : '')
      ],
      [
        'Payback Period',
        formatYears(options[0].paybackPeriod) + (options[0].paybackPeriod === bestPayback ? ' *' : ''),
        formatYears(options[1].paybackPeriod) + (options[1].paybackPeriod === bestPayback ? ' *' : ''),
        formatYears(options[2].paybackPeriod) + (options[2].paybackPeriod === bestPayback ? ' *' : '')
      ],
      [
        `Total Profit (${analysisYears} years)`,
        formatCurrency(options[0].totalProfit),
        formatCurrency(options[1].totalProfit),
        formatCurrency(options[2].totalProfit)
      ],
      [
        'Safety/Quality Impact',
        getSafetyText(options[0].safety),
        getSafetyText(options[1].safety),
        getSafetyText(options[2].safety)
      ]
    ]

    doc.autoTable({
      startY: 50,
      head: [['Metric', options[0].name, options[1].name, options[2].name]],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    })

    // Recommendation
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.setTextColor(72, 198, 239)
    doc.text('Recommendation', 14, finalY)

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const recommendationText = `Recommended Investment: ${winner.name} (Score: ${winner.score}/100)`
    doc.text(recommendationText, 14, finalY + 8)

    const reasonText = `This option offers ${winner.reasons.join(', ')} with an ROI of ${formatPercent(options[winner.index].roi)} and a payback period of ${formatYears(options[winner.index].paybackPeriod)}.`
    const splitText = doc.splitTextToSize(reasonText, 180)
    doc.text(splitText, 14, finalY + 16)

    // Note about best values
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('* Indicates best value for the metric', 14, finalY + 35)

    // Save PDF
    doc.save('investment-comparison.pdf')
  }

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ['Capital Investment Comparison Report'],
      [],
      ['Generated:', new Date().toLocaleDateString()],
      ['Analysis Period:', `${analysisYears} years`],
      [],
      ['Metric', options[0].name, options[1].name, options[2].name],
      ['Initial Investment', options[0].investment, options[1].investment, options[2].investment],
      ['Annual Savings', options[0].savings, options[1].savings, options[2].savings],
      ['Annual Operating Costs', options[0].operating, options[1].operating, options[2].operating],
      ['Net Annual Benefit', options[0].netAnnualBenefit, options[1].netAnnualBenefit, options[2].netAnnualBenefit],
      ['ROI (%)', options[0].roi, options[1].roi, options[2].roi],
      ['Payback Period (years)', options[0].paybackPeriod, options[1].paybackPeriod, options[2].paybackPeriod],
      [`Total Profit (${analysisYears} years)`, options[0].totalProfit, options[1].totalProfit, options[2].totalProfit],
      ['Safety/Quality Impact', options[0].safety, options[1].safety, options[2].safety],
      [],
      ['Recommendation'],
      ['Winner:', winner.name],
      ['Score:', winner.score],
      ['Reasons:', winner.reasons.join(', ')],
      ['ROI:', formatPercent(options[winner.index].roi)],
      ['Payback Period:', formatYears(options[winner.index].paybackPeriod)]
    ]

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)

    // Set column widths
    wsSummary['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 }
    ]

    // Add summary sheet
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // Detailed Data Sheet
    const detailData = [
      ['Option Details'],
      [],
      ['Option 1: ' + options[0].name],
      ['Initial Investment', options[0].investment],
      ['Annual Savings', options[0].savings],
      ['Annual Operating Costs', options[0].operating],
      ['Net Annual Benefit', options[0].netAnnualBenefit],
      ['ROI (%)', options[0].roi],
      ['Payback Period (years)', options[0].paybackPeriod],
      [`Total Profit (${analysisYears} years)`, options[0].totalProfit],
      ['Safety/Quality Impact', options[0].safety],
      [],
      ['Option 2: ' + options[1].name],
      ['Initial Investment', options[1].investment],
      ['Annual Savings', options[1].savings],
      ['Annual Operating Costs', options[1].operating],
      ['Net Annual Benefit', options[1].netAnnualBenefit],
      ['ROI (%)', options[1].roi],
      ['Payback Period (years)', options[1].paybackPeriod],
      [`Total Profit (${analysisYears} years)`, options[1].totalProfit],
      ['Safety/Quality Impact', options[1].safety],
      [],
      ['Option 3: ' + options[2].name],
      ['Initial Investment', options[2].investment],
      ['Annual Savings', options[2].savings],
      ['Annual Operating Costs', options[2].operating],
      ['Net Annual Benefit', options[2].netAnnualBenefit],
      ['ROI (%)', options[2].roi],
      ['Payback Period (years)', options[2].paybackPeriod],
      [`Total Profit (${analysisYears} years)`, options[2].totalProfit],
      ['Safety/Quality Impact', options[2].safety]
    ]

    const wsDetail = XLSX.utils.aoa_to_sheet(detailData)
    wsDetail['!cols'] = [{ wch: 30 }, { wch: 20 }]

    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detailed Data')

    // Save file
    XLSX.writeFile(wb, 'investment-comparison.xlsx')
  }

  return (
    <div className="export-buttons">
      <h3>📥 Export Results</h3>
      <div className="button-group">
        <button onClick={exportToPDF} className="export-btn pdf-btn">
          📄 Export to PDF
        </button>
        <button onClick={exportToExcel} className="export-btn excel-btn">
          📊 Export to Excel
        </button>
      </div>
    </div>
  )
}

export default ExportButtons
