import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine } from 'recharts';
import dayjs from 'dayjs';

// Chart configuration for colors and labels
const chartConfig = {
  developer: {
    label: 'Developer',
    color: 'hsl(var(--chart-1))',
  },
  feature: {
    label: 'Feature',
    color: 'hsl(var(--chart-2))',
  },
  adhoc: {
    label: 'Ad Hoc',
    color: 'hsl(var(--chart-3))',
  },
};

// Custom Tooltip Component
const TooltipComponent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background px-3 py-2 rounded-md border border-border shadow-sm">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-sm text-gray-600">
            {`${dayjs(item.value[0]).format('MMM D, YYYY')} - ${dayjs(item.value[1]).format('MMM D, YYYY')}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// BarChart Component
const BarChartComponent = ({ chartData, developerChart }) => {
  // Process chart data
  const processedData = chartData
    .sort((a, b) => a.start - b.start)
    .map((item) => ({
      name: item.name,
      period1: [item.start, item.end],
    }));

  // Calculate min and max dates for the XAxis
  const minDate = processedData.length > 0
    ? dayjs(processedData[0].period1[0]).subtract(14, 'day').valueOf()
    : dayjs().subtract(14, 'day').valueOf();
  const maxDate = dayjs().add(120, 'day').valueOf();

  // Process developer-specific data
  if (developerChart) {
    const developerData = chartData.flatMap((item) => {
      const developerStart = item.features.reduce((acc, feature) => (
        Math.min(acc, feature.startDate ? feature.startDate : new Date())
      ), Infinity);

      const developerEnd = item.features.reduce((acc, feature) => (
        feature.startDate && feature.estimate
          ? Math.max(acc, dayjs(feature.startDate).add(feature.estimate, 'day').valueOf())
          : acc
      ), dayjs().add(1, 'day').valueOf());

      const features = item.features.map((feature) => ({
        name: feature.title,
        period1: [feature.startDate || dayjs().valueOf(), dayjs(feature.startDate).add(feature.estimate, 'day').valueOf()],
        type: 'feature',
      }));

      const adhocTasks = item.adhoc.map((task) => ({
        name: task.title,
        period1: [task.startDate || dayjs().valueOf(), dayjs(task.startDate).add(task.estimate, 'day').valueOf()],
        type: 'adhoc',
      }));

      return [
        {
          name: item.developer?.name,
          period1: [developerStart, developerEnd],
          type: 'developer',
        },
        ...features,
        ...adhocTasks,
      ];
    });

    return (
      <ChartContainer
        config={chartConfig}
        style={{ height: chartData.length * 120, width: '100%' }}
      >
        <BarChart
          data={developerData}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          layout="vertical"
        >
          <YAxis dataKey="name" type="category" interval={0} width={250} />
          <XAxis
            type="number"
            domain={[minDate, maxDate]}
            tickFormatter={(day) => dayjs(day).format('MMM YYYY')}
          />
          <ChartTooltip content={<TooltipComponent />} />
          <Bar
            dataKey="period1"
            layout="vertical"
            radius={5}
            shape={(props) => {
              const { x, y, width, height, type, name } = props;
              const padding = 5;
              return type === 'developer' ? (
                <text
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  dy={25}
                  fill={chartConfig.developer.color}
                  fontWeight="bold"
                  fontSize={19}
                >
                  {name}
                </text>
              ) : (
                <rect
                  x={x}
                  y={y + padding}
                  width={width}
                  height={height - 2 * padding}
                  rx={10}
                  fill={type === 'feature' ? chartConfig.feature.color : chartConfig.adhoc.color}
                />
              );
            }}
          />
          <ReferenceLine
            x={dayjs().valueOf()}
            stroke="hsl(var(--primary))"
            strokeDasharray="3 3"
            label={{
              value: `Today: ${dayjs().format('D MMM YYYY')}`,
              position: 'top',
              fill: 'hsl(var(--primary))',
              fontSize: 12,
            }}
          />
        </BarChart>
      </ChartContainer>
    );
  }

  // Default BarChart for non-developer data
  return (
    <ChartContainer config={chartConfig} style={{ height: chartData.length * 50, width: '100%' }}>
      <BarChart data={processedData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }} layout="vertical">
        <YAxis dataKey="name" type="category" interval={0} width={250} />
        <XAxis
          type="number"
          domain={[minDate, maxDate]}
          tickFormatter={(day) => dayjs(day).format('MMM YYYY')}
        />
        <ChartTooltip content={<TooltipComponent />} />
        <Bar dataKey="period1" fill={chartConfig.feature.color} layout="vertical" radius={5} />
        <ReferenceLine
          x={dayjs().valueOf()}
          stroke="hsl(var(--primary))"
          strokeDasharray="3 3"
          label={{
            value: `Today: ${dayjs().format('D MMM YYYY')}`,
            position: 'top',
            fill: 'hsl(var(--primary))',
            fontSize: 12,
          }}
        />
      </BarChart>
    </ChartContainer>
  );
};

export default BarChartComponent;