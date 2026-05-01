import type { ServiceConfig, ServiceHealth } from './types';

function getAbsoluteUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
  const startedAt = Date.now();

  if (service.url.startsWith('/')) {
    return {
      ...service,
      status: 'online',
      statusCode: 200,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(getAbsoluteUrl(service.url), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    return {
      ...service,
      status: response.ok ? 'online' : 'degraded',
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ...service,
      status: 'unknown',
      statusCode: null,
      latencyMs: null,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkServicesHealth(services: ServiceConfig[]) {
  return Promise.all(services.map((service) => checkServiceHealth(service)));
}