import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import type { SwimResults } from '@shared/domain';
import { formatTime } from '@shared/format';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  temps: {
    label: 'Temps',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface DistanceLineChartProps {
  results: SwimResults;
  objectifTimeSeconds?: number;
}

export function DistanceLineChart({ results, objectifTimeSeconds }: DistanceLineChartProps) {
  const data = [...results]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }),
      temps: r.timeSeconds,
    }));

  if (data.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
        Aucune donnée Strava pour cette distance pour le moment.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <LineChart data={data} margin={{ left: 12, right: 12, top: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatTime(value)}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => formatTime(Number(value))} />}
        />
        {objectifTimeSeconds !== undefined && (
          <ReferenceLine
            y={objectifTimeSeconds}
            stroke="var(--destructive)"
            strokeDasharray="4 4"
            label={{
              value: `Objectif : ${formatTime(objectifTimeSeconds)}`,
              position: 'insideTopLeft',
              fill: 'var(--destructive)',
              fontSize: 12,
            }}
          />
        )}
        <Line dataKey="temps" type="monotone" stroke="var(--color-temps)" strokeWidth={2} dot />
      </LineChart>
    </ChartContainer>
  );
}
