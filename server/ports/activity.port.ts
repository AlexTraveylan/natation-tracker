import type { SwimResults } from '../../shared/domain.js';

export interface ActivityProviderPort {
  getSwimResults(): Promise<SwimResults>;
}
