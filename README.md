# Capital Investment Comparison Tool

A React-based web application for comparing capital investment options using ROI (Return on Investment) and Payback Period analysis.

## Features

- **Compare 3 Investment Options**: Enter details for up to three different capital investment alternatives
- **Financial Metrics**:
  - Return on Investment (ROI)
  - Payback Period
  - Net Annual Benefit
  - Total Profit over analysis period
- **Safety/Quality Assessment**: Evaluate non-financial impacts of each investment
- **Smart Recommendations**: Algorithm-based scoring system to recommend the best investment
- **Export Capabilities**:
  - Export results to PDF
  - Export results to Excel spreadsheet
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Input Parameters

For each investment option, you'll need to provide:

1. **Investment Name**: Descriptive name for the option
2. **Initial Investment**: Upfront capital required ($)
3. **Annual Savings/Benefits**: Expected annual financial benefits ($)
4. **Annual Operating Costs**: Ongoing yearly costs ($)
5. **Safety/Quality Impact**: Qualitative assessment (High/Medium/Low)

You'll also specify an **Analysis Period** (in years) for the comparison.

## Calculations

### Net Annual Benefit
```
Net Annual Benefit = Annual Savings - Annual Operating Costs
```

### Return on Investment (ROI)
```
Total Profit = (Net Annual Benefit × Years) - Initial Investment
ROI = (Total Profit / Initial Investment) × 100
```

### Payback Period
```
Payback Period = Initial Investment / Net Annual Benefit
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SandBox
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and development server
- **jsPDF**: PDF generation
- **jsPDF-AutoTable**: Table formatting for PDFs
- **XLSX**: Excel file generation

## Usage

1. Fill in the details for three investment options
2. Specify the analysis period (years)
3. Click "Calculate & Compare"
4. Review the comparison table with highlighted best values
5. Read the recommendation based on scoring algorithm
6. Export results to PDF or Excel as needed

## Scoring Algorithm

The recommendation is based on a 100-point scoring system:

- **ROI (40 points)**: Best ROI gets 40 points, close alternatives get 30
- **Payback Period (40 points)**: Shortest payback gets 40 points, close alternatives get 30
- **Safety/Quality (20 points)**: High = 20, Medium = 12, Low = 5

The option with the highest total score is recommended.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Created with Claude Code
