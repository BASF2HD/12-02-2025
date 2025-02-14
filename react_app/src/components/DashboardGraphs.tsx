
import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Sample } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardGraphsProps {
  samples: Sample[];
}

type DataField = 'type' | 'specimen' | 'investigationType';

export function DashboardGraphs({ samples }: DashboardGraphsProps) {
  const [selectedField, setSelectedField] = useState<DataField>('type');

  const chartData = useMemo(() => {
    const counts = samples.reduce((acc, sample) => {
      const key = sample[selectedField];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: `Sample Distribution by ${selectedField}`,
          data: Object.values(counts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [samples, selectedField]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Sample Distribution by ${selectedField}`,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value as DataField)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="type">Type</option>
          <option value="specimen">Specimen</option>
          <option value="investigationType">Investigation Type</option>
        </select>
      </div>
      <div className="h-[400px]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}
