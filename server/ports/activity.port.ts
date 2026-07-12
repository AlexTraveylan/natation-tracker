import type { SwimResults } from "../../shared/domain";

export interface ActivityProviderPort {
  getSwimResults(): Promise<SwimResults>;
}
