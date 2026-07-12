import { EdgeConfigStorageAdapter } from "./adapters/storage/edgeConfig.adapter";
import { OpenAiLlmAdapter } from "./adapters/llm/openai.adapter";
import { StravaActivityAdapter } from "./adapters/activity/strava.adapter";

export const storage = new EdgeConfigStorageAdapter();
export const llm = new OpenAiLlmAdapter();
export const activityProvider = new StravaActivityAdapter();
