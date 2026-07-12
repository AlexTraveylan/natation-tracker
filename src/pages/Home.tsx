import { useState } from "react"
import { Link } from "react-router-dom"
import { DISTANCES, type Distance } from "@shared/domain"
import { useEntrainement, useObjectifs, useSwimResults } from "@/hooks/api"
import { DistanceLineChart } from "@/components/distance-line-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [distance, setDistance] = useState<Distance>(100)

  const objectifsQuery = useObjectifs()
  const swimResultsQuery = useSwimResults()
  const entrainementQuery = useEntrainement()

  const objectif = objectifsQuery.data?.find((o) => o.distance === distance)
  const results = (swimResultsQuery.data ?? []).filter(
    (r) => r.distance === distance,
  )

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Objectifs natation</h1>
        <Button variant="outline" asChild>
          <Link to="/settings">Réglages</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Progression</CardTitle>
          <Select
            value={String(distance)}
            onValueChange={(v) => setDistance(Number(v) as Distance)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTANCES.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {swimResultsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <DistanceLineChart
              results={results}
              objectifTimeSeconds={objectif?.targetTimeSeconds}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dernier entraînement généré</CardTitle>
        </CardHeader>
        <CardContent>
          {entrainementQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : entrainementQuery.data ? (
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {entrainementQuery.data.content}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun entraînement généré pour le moment. Rends-toi dans les
              réglages pour en générer un.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
