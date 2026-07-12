import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
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

interface DistanceBarChartProps {
  results: SwimResults;
  objectifTimeSeconds?: number;
}

const MIN_PADDING_SECONDS = 2;

export function DistanceBarChart({ results, objectifTimeSeconds }: DistanceBarChartProps) {
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

  const values = data
    .map((d) => d.temps)
    .concat(objectifTimeSeconds !== undefined ? [objectifTimeSeconds] : []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.1, MIN_PADDING_SECONDS);
  const domain: [number, number] = [min - padding, max + padding];

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <BarChart data={data} margin={{ left: 12, right: 12, top: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatTime(value)}
          domain={domain}
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
        <Bar dataKey="temps" fill="var(--color-temps)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
