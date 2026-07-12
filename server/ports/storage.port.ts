import type { Entrainement, Objectifs, SwimResultsCache } from "../../shared/domain.js";

export interface StoragePort {
  getObjectifs(): Promise<Objectifs>;
  setObjectifs(objectifs: Objectifs): Promise<void>;

  getPrompt(): Promise<string>;
  setPrompt(prompt: string): Promise<void>;

  getLastEntrainement(): Promise<Entrainement | null>;
  setLastEntrainement(entrainement: Entrainement): Promise<void>;

  getSwimResultsCache(): Promise<SwimResultsCache | null>;
  setSwimResultsCache(cache: SwimResultsCache): Promise<void>;
}
