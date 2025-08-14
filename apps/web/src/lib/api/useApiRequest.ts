import { useState, useEffect, useCallback, useRef } from 'react';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import api from './axios';
import { idbStorage } from '../storage/IdbStorageService';

export interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface ApiRequestOptions {
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number; // in minutes
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  debounce?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

const defaultOptions: Required<ApiRequestOptions> = {
  cache: false,
  cacheKey: '',
  cacheTTL: 60, // 1 hour
  retry: false,
  retryAttempts: 3,
  retryDelay: 1000,
  debounce: 0,
  onSuccess: () => {},
  onError: () => {},
};

export function useApiRequest<T = any>(
  config: ApiRequestConfig | null,
  options: ApiRequestOptions = {}
) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const optionsRef = useRef({ ...defaultOptions, ...options });
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceSubjectRef = useRef<BehaviorSubject<ApiRequestConfig | null>>(
    new BehaviorSubject(config)
  );

  const executeRequest = useCallback(
    async (requestConfig: ApiRequestConfig): Promise<T> => {
      const { cache, cacheKey, cacheTTL, retry, retryAttempts, retryDelay, onSuccess, onError } = optionsRef.current;

      // Check cache first
      if (cache && cacheKey) {
        const cachedData = await idbStorage.getCache(cacheKey);
        if (cachedData) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          }));
          onSuccess(cachedData);
          return cachedData;
        }
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const makeRequest = async (attempt: number = 1): Promise<T> => {
        try {
          const response = await api.request({
            ...requestConfig,
            signal: abortControllerRef.current?.signal,
          });

          const data = response.data;

          // Cache the response if enabled
          if (cache && cacheKey) {
            await idbStorage.setCache(cacheKey, data, cacheTTL);
          }

          setState({
            data,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          });

          onSuccess(data);
          return data;
        } catch (error: any) {
          // Handle abort
          if (error.name === 'AbortError') {
            throw error;
          }

          const errorMessage = error.response?.data?.message || error.message || 'Request failed';

          // Retry logic
          if (retry && attempt < retryAttempts && !error.response?.status?.toString().startsWith('4')) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            return makeRequest(attempt + 1);
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));

          onError(errorMessage);
          throw new Error(errorMessage);
        }
      };

      return makeRequest();
    },
    []
  );

  const refetch = useCallback(async () => {
    if (!config) return;

    // Clear cache if it exists
    if (optionsRef.current.cache && optionsRef.current.cacheKey) {
      await idbStorage.removeCache(optionsRef.current.cacheKey);
    }

    try {
      await executeRequest(config);
    } catch (error) {
      // Error is already handled in executeRequest
    }
  }, [config, executeRequest]);

  const mutate = useCallback(
    async (newData: T) => {
      setState(prev => ({
        ...prev,
        data: newData,
        lastUpdated: new Date(),
      }));

      // Update cache if enabled
      if (optionsRef.current.cache && optionsRef.current.cacheKey) {
        await idbStorage.setCache(optionsRef.current.cacheKey, newData, optionsRef.current.cacheTTL);
      }
    },
    []
  );

  const clearCache = useCallback(async () => {
    if (optionsRef.current.cacheKey) {
      await idbStorage.removeCache(optionsRef.current.cacheKey);
    }
  }, []);

  // Debounced request execution
  useEffect(() => {
    if (!config) return;

    const { debounce } = optionsRef.current;
    const subject = debounceSubjectRef.current;

    const subscription = subject
      .pipe(
        debounceTime(debounce),
        distinctUntilChanged()
      )
      .subscribe(async (requestConfig) => {
        if (requestConfig) {
          try {
            await executeRequest(requestConfig);
          } catch (error) {
            // Error is already handled in executeRequest
          }
        }
      });

    return () => {
      subscription.unsubscribe();
      abortControllerRef.current?.abort();
    };
  }, [config, executeRequest]);

  // Update debounce subject when config changes
  useEffect(() => {
    debounceSubjectRef.current.next(config);
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...state,
    refetch,
    mutate,
    clearCache,
  };
}

// Hook for simple GET requests
export function useGet<T = any>(url: string, options?: ApiRequestOptions) {
  return useApiRequest<T>(
    { method: 'GET', url },
    { cache: true, cacheKey: url, ...options }
  );
}

// Hook for simple POST requests
export function usePost<T = any>(url: string, options?: ApiRequestOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (postData?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<T>(url, postData);
        setData(response.data);
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Request failed';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
}
