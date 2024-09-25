import { ReporterService } from '../reporter/reporter.service';

export function TrackErrors(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      ReporterService.counter('function_error_count', {
        function_name: propertyKey,
      });
      throw error;
    }
  };

  return descriptor;
}
