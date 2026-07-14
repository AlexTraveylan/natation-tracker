import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { DISTANCES, type Distance, type Objectifs } from '@shared/domain';
import { formatTime, parseTime } from '@shared/format';
import { RECORD_ATTEMPT_COEFFICIENT, getEffectiveTargetTimeSeconds } from '@shared/constants';
import {
  useEntrainement,
  useGenerateEntrainement,
  useObjectifs,
  usePrompt,
  useSetObjectifs,
  useSetPrompt,
  useVerifyPassword,
} from '@/hooks/api';
import { getStoredPassword } from '@/lib/settings-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const verify = useVerifyPassword();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verify.mutate(password, {
      onSuccess: (ok) => {
        if (ok) onUnlock();
        else toast.error('Mot de passe incorrect');
      },
      onError: () => toast.error('Erreur de vérification'),
    });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Réglages</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <Button type="submit" disabled={verify.isPending}>
          {verify.isPending ? 'Vérification…' : 'Déverrouiller'}
        </Button>
      </form>
      <Link to="/" className="text-sm text-muted-foreground underline">
        Retour aux graphs
      </Link>
    </div>
  );
}

function ObjectifsEditor() {
  const objectifsQuery = useObjectifs();
  const setObjectifs = useSetObjectifs();
  const [values, setValues] = useState<Record<Distance, string>>({} as Record<Distance, string>);

  useEffect(() => {
    if (!objectifsQuery.data) return;
    const next = {} as Record<Distance, string>;
    for (const d of DISTANCES) {
      next[d] = formatTime(getEffectiveTargetTimeSeconds(d, objectifsQuery.data));
    }
    setValues(next);
  }, [objectifsQuery.data]);

  function handleSave() {
    const objectifs: Objectifs = [];
    for (const d of DISTANCES) {
      const raw = values[d]?.trim();
      if (!raw) continue;
      const seconds = parseTime(raw);
      if (seconds === null) {
        toast.error(`Temps invalide pour ${d}m (format attendu mm:ss)`);
        return;
      }
      objectifs.push({ distance: d, targetTimeSeconds: seconds });
    }
    setObjectifs.mutate(objectifs, {
      onSuccess: () => toast.success('Objectifs enregistrés'),
      onError: () => toast.error("Échec de l'enregistrement"),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectifs de temps</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {DISTANCES.map((d) => (
          <div key={d} className="flex items-center gap-3">
            <Label className="w-16 shrink-0">{d} m</Label>
            <Input
              placeholder="mm:ss"
              value={values[d] ?? ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [d]: e.target.value }))}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={setObjectifs.isPending} className="self-start">
          {setObjectifs.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <p className="text-sm text-muted-foreground">
          Seules les tentatives sous {RECORD_ATTEMPT_COEFFICIENT}× l'objectif (soit +
          {Math.round((RECORD_ATTEMPT_COEFFICIENT - 1) * 100)}&nbsp;%) sont affichées dans le
          graphique de progression — les temps plus lents sont considérés comme de l'entraînement ou
          de la récupération.
        </p>
      </CardContent>
    </Card>
  );
}

function PromptEditor() {
  const promptQuery = usePrompt();
  const setPrompt = useSetPrompt();
  const generate = useGenerateEntrainement();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (promptQuery.data !== undefined) setValue(promptQuery.data);
  }, [promptQuery.data]);

  function handleSave() {
    setPrompt.mutate(value, {
      onSuccess: () => toast.success('Prompt enregistré'),
      onError: () => toast.error("Échec de l'enregistrement"),
    });
  }

  function handleGenerate() {
    generate.mutate(undefined, {
      onSuccess: () => toast.success('Entraînement généré'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Échec de la génération'),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt de génération d'entraînement</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea rows={8} value={value} onChange={(e) => setValue(e.target.value)} />
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={setPrompt.isPending}>
            {setPrompt.isPending ? 'Enregistrement…' : 'Enregistrer le prompt'}
          </Button>
          <Button onClick={handleGenerate} disabled={generate.isPending}>
            {generate.isPending ? 'Génération…' : 'Générer un entraînement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LastEntrainement() {
  const entrainementQuery = useEntrainement();
  if (!entrainementQuery.data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dernier entraînement généré</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm">
          {entrainementQuery.data.content}
        </pre>
      </CardContent>
    </Card>
  );
}

function SettingsForm() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Réglages</h1>
        <Button variant="outline" asChild>
          <Link to="/">Retour aux graphs</Link>
        </Button>
      </div>
      <ObjectifsEditor />
      <PromptEditor />
      <LastEntrainement />
    </div>
  );
}

export default function Settings() {
  const [unlocked, setUnlocked] = useState(() => getStoredPassword() !== null);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return <SettingsForm />;
}
