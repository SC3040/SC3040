import { Injectable, Inject } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly counter: { [key: string]: Counter<string> } = {};
  private readonly gauge: { [key: string]: Gauge<string> } = {};
  private readonly histograms: { [key: string]: Histogram<string> } = {};

  constructor(@Inject(Registry) private readonly registry: Registry) {}

  public incCounter(
    key: string,
    labels?: Record<string, string | number>,
  ): void {
    if (!this.counter[key]) {
      this.counter[key] = new Counter({
        name: key,
        help: `Counter for ${key}`,
        labelNames: labels ? Object.keys(labels) : [],
        registers: [this.registry],
      });
    }
    this.counter[key].inc(labels);
  }

  public setGauge(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
  ): void {
    if (!this.gauge[key]) {
      this.gauge[key] = new Gauge({
        name: key,
        help: `Gauge for ${key}`,
        labelNames: labels ? Object.keys(labels) : [],
        registers: [this.registry],
      });
    }
    this.gauge[key].set(labels, value);
  }

  public observeHistogram(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
  ): void {
    if (!this.histograms[key]) {
      this.histograms[key] = new Histogram({
        name: key,
        help: `Histogram for ${key}`,
        labelNames: labels ? Object.keys(labels) : [],
        buckets: [0.01, 0.1, 0.2, 0.4, 1, 2, 5, 10],
        registers: [this.registry],
      });
    }
    this.histograms[key].observe(labels, value);
  }
}
