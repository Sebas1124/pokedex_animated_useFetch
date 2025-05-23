import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api'; // Usa la instancia configurada de Axios
import type { AxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  statusCode?: number | null;
}

interface UseFetchOptions extends AxiosRequestConfig {
  manual?: boolean;
}

export const useFetch = <T = any>(
  url: string,
  options: UseFetchOptions = {}
) => {
  const { method = 'get', data: requestData, params, headers, manual = false, ...restOptions } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !manual,
    error: null,
    statusCode: null,
  });

  const savedUrl = useRef(url);
  const savedOptions = useRef(options);

  useEffect(() => {
    savedUrl.current = url;
    savedOptions.current = options;
  }, [url, options]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (executeOptions?: UseFetchOptions) => {

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const currentOpts = { ...savedOptions.current, ...executeOptions };
    const currentUrl = executeOptions?.url || savedUrl.current;
    const currentMethod = executeOptions?.method || currentOpts.method || 'get';
    const currentData = executeOptions?.data || currentOpts.data;
    const currentParams = executeOptions?.params || currentOpts.params;
    const currentHeaders = { ...currentOpts.headers, ...executeOptions?.headers };


    setState(prevState => ({ ...prevState, loading: true, error: null, statusCode: null }));

    try {

      const response = await api.request<T>({
        url: currentUrl,
        method: currentMethod,
        data: currentData,
        params: currentParams,
        headers: currentHeaders,
        signal: abortControllerRef.current.signal,
        ...restOptions,
      });

      setState({ data: response.data, loading: false, error: null, statusCode: response.status });
      return { data: response.data, error: null, statusCode: response.status };
    } catch (err) {
      const error = err as AxiosError<{ message?: string, errors?: any[] }>;

      // Ignora errores de aborto
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('Fetch aborted');
        setState(prevState => ({ ...prevState, loading: false }));
        return { data: null, error: 'Aborted', statusCode: null };
      }

      const errorMessage = error.response?.data?.message || 
        (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
        error.message ||
        'Ocurrió un error desconocido.';
      const status = error.response?.status || null;

      console.error(`useFetch Error (${currentMethod.toUpperCase()} ${currentUrl}):`, errorMessage, error.response || error);

      setState({ data: null, loading: false, error: errorMessage, statusCode: status });
      return { data: null, error: errorMessage, statusCode: status };
    }
  }, [restOptions]);

  // Ejecución automática si no es manual
  useEffect(() => {
    if (!manual) {
      execute();
    }
   
  }, [manual, execute]); // Ejecutar si cambia 'manual' o 'execute' (que depende de options)


  return { ...state, execute };
};