import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function ChartCard({ chart }) {
  const { type, title, labels, data } = chart;

  // Chart configuration
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: data,
        backgroundColor:
          type === 'pie'
            ? [
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
              ]
            : 'rgba(168, 85, 247, 0.7)',
        borderColor:
          type === 'pie'
            ? [
                'rgba(168, 85, 247, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
              ]
            : 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        tension: 0.4, // For line chart smoothness
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: type === 'pie',
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
          padding: 15,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 1,
      },
    },
    scales:
      type !== 'pie'
        ? {
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: 'rgba(55, 65, 81, 0.3)' },
            },
            y: {
              ticks: { color: '#9ca3af' },
              grid: { color: 'rgba(55, 65, 81, 0.3)' },
            },
          }
        : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg transition hover:shadow-purple-500/30">
      <h3 className="text-xl font-bold text-pink-400 mb-4">{title}</h3>
      <div className="h-64">{renderChart()}</div>
    </div>
  );
}

export default ChartCard;
