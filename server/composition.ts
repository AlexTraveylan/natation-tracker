import { EdgeConfigStorageAdapter } from './adapters/storage/edgeConfig.adapter.js';
import { OpenAiLlmAdapter } from './adapters/llm/openai.adapter.js';
import { StravaActivityAdapter } from './adapters/activity/strava.adapter.js';

export const storage = new EdgeConfigStorageAdapter();
export const llm = new OpenAiLlmAdapter();
export const activityProvider = new StravaActivityAdapter();
