import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleChartProps {
  data: ChartData[];
  type: 'bar' | 'pie';
  title?: string;
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  type, 
  title, 
  height = 200 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-20 text-sm text-gray-600 truncate">{item.label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                backgroundColor: item.color,
                width: `${(item.value / maxValue) * 100}%`,
                minWidth: item.value > 0 ? '2rem' : '0'
              }}
            >
              <span className="text-xs font-medium text-white">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg width={height} height={height} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const strokeDasharray = `${percentage * 100} ${100 - percentage * 100}`;
              const strokeDashoffset = -currentAngle;
              currentAngle += percentage * 100;

              return (
                <circle
                  key={index}
                  cx={height / 2}
                  cy={height / 2}
                  r={height / 2 - 20}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {title && <h4 className="font-medium text-gray-900">{title}</h4>}
      <div style={{ height }}>
        {type === 'bar' ? renderBarChart() : renderPieChart()}
      </div>
    </div>
  );
};

export default SimpleChart; 