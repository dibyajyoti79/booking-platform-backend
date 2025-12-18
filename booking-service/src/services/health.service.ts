import quicker from "../utils/quicker";

/**
 * Service layer for Health check business logic
 */
export class HealthService {
  /**
   * Get application and system health
   */
  getHealth() {
    return {
      application: quicker.getApplicationHealth(),
      system: quicker.getSystemHealth(),
    };
  }
}

