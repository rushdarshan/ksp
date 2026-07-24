import { toast } from 'react-hot-toast';
import { isWarmupActive, startWarmup } from './apiWarmup';

const BASE_URL = import.meta.env.VITE_API_URL || '/server';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function installFetchInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (input, init = {}) {
    const urlString = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.toString() 
        : input?.url || '';

    const isServerRequest = urlString.includes('/server/') || urlString.includes(BASE_URL);
    
    // Detect custom headers
    let isWarmupCall = false;
    if (init && init.headers) {
      if (init.headers instanceof Headers) {
        isWarmupCall = init.headers.has('X-Warmup') || init.headers.has('x-warmup');
      } else if (typeof init.headers === 'object') {
        isWarmupCall = init.headers['X-Warmup'] || init.headers['x-warmup'];
      }
    }

    // Delay normal requests while system is warming up
    if (isServerRequest && isWarmupActive() && !isWarmupCall) {
      await startWarmup();
    }

    if (!isServerRequest) {
      return originalFetch.apply(this, arguments);
    }

    let retries = 2;
    let delay = 400;

    while (retries >= 0) {
      try {
        const response = await originalFetch.apply(this, arguments);

        if ((response.status === 504 || response.status === 502) && retries > 0) {
          retries--;
          await wait(delay);
          delay *= 2;
          continue;
        }

        return response;
      } catch (error) {
        if (retries > 0) {
          retries--;
          await wait(delay);
          delay *= 2;
          continue;
        }
        // Surface non-blocking toast warning for network errors
        toast.error(`Gateway timeout or network error on: ${urlString.split('/').pop().split('?')[0]}`);
        throw error;
      }
    }
  };
}
