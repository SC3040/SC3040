import { MetricsService } from '../metrics/metrics.service';

export class ReporterService {
  private static metricsService: MetricsService;

  static init(metricsService: MetricsService): void {
    ReporterService.metricsService = metricsService;
  }

  static counter(key: string, labels?: Record<string, string | number>): void {
    ReporterService.metricsService.incCounter(key, labels);
  }

  static gauge(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
  ): void {
    ReporterService.metricsService.setGauge(key, value, labels);
  }
}
