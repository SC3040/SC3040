import { Injectable, NestMiddleware } from '@nestjs/common';
import { ReporterService } from '../reporter/reporter.service';

@Injectable()
export class RequestTimingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = process.hrtime();
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const durationInSeconds = seconds + nanoseconds / 1e9;
      ReporterService.gauge(
        'http_request_duration_seconds',
        durationInSeconds,
        {
          method: req.method,
          route: req.route ? req.route.path : '',
          status: res.statusCode.toString(),
        },
      );
    });
    next();
  }
}
