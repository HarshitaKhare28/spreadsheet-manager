import SummaryCard from './SummaryCard';
import ChartCard from './ChartCard';
import ResultTable from './ResultTable';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';
import { useState } from 'react';

function Dashboard({ data }) {
  const [exporting, setExporting] = useState(false);

  // Safety check
  if (!data || !data.summary) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400">
          No dashboard data available. Please upload a file first.
        </p>
      </div>
    );
  }

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const dashboard = document.getElementById('dashboard-content');
      if (!dashboard) {
        throw new Error('Dashboard content not found');
      }

      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture the dashboard
      const dataUrl = await domtoimage.toPng(dashboard, {
        quality: 1,
        bgcolor: '#111827',
      });

      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create PDF in A4 format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit A4
      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = imgWidth / imgHeight;
      
      let width = pdfWidth;
      let height = pdfWidth / ratio;
      
      // If height is more than page, scale down
      if (height > pdfHeight) {
        height = pdfHeight;
        width = pdfHeight * ratio;
      }

      let position = 0;
      let heightLeft = imgHeight;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, width, height);
      heightLeft -= pdfHeight * (imgHeight / height);

      // Add more pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position * (height / imgHeight), width, height);
        heightLeft -= pdfHeight * (imgHeight / height);
      }

      const fileName = data.summary.file_name.replace(/\.[^/.]+$/, '');
      pdf.save(`dashboard-${fileName}.pdf`);
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`Failed to export PDF: ${error.message}`);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-gray-900 font-semibold py-3 px-6 rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {exporting ? '📥 Exporting...' : '📥 Download PDF'}
        </button>
      </div>

      {/* Dashboard Content */}
      <div id="dashboard-content" className="space-y-6 p-6 bg-gray-900 rounded-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">
            📊 Data Analytics Dashboard
          </h2>
          <p className="text-gray-400">File: {data.summary.file_name}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Rows"
            value={data.summary.total_rows.toLocaleString()}
            icon="📊"
            color="purple"
          />
          <SummaryCard
            title="Total Columns"
            value={data.summary.total_columns}
            icon="📋"
            color="blue"
          />
          <SummaryCard
            title="Numeric Fields"
            value={data.summary.numeric_columns}
            icon="🔢"
            color="green"
          />
          <SummaryCard
            title="Text Fields"
            value={data.summary.categorical_columns}
            icon="📝"
            color="orange"
          />
        </div>

        {/* Numeric Statistics */}
        {Object.keys(data.numeric_stats).length > 0 && (
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">
              📈 Numeric Statistics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-200">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="p-3">Column</th>
                    <th className="p-3">Min</th>
                    <th className="p-3">Max</th>
                    <th className="p-3">Mean</th>
                    <th className="p-3">Median</th>
                    <th className="p-3">Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.numeric_stats).map(([col, stats]) => (
                    <tr key={col} className="border-b border-gray-700">
                      <td className="p-3 font-semibold text-purple-300">{col}</td>
                      <td className="p-3">{stats.min.toFixed(2)}</td>
                      <td className="p-3">{stats.max.toFixed(2)}</td>
                      <td className="p-3">{stats.mean.toFixed(2)}</td>
                      <td className="p-3">{stats.median.toFixed(2)}</td>
                      <td className="p-3">{stats.sum.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.charts.map((chart, idx) => (
            <ChartCard key={idx} chart={chart} />
          ))}
        </div>

        {/* Data Preview */}
        {data.preview && data.preview.length > 0 && (
          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-pink-400 mb-4">
              👀 Data Preview (First 10 Rows)
            </h3>
            <div className="overflow-x-auto">
              <ResultTable data={data.preview} dark />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
