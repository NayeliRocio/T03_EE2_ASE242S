import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executesFetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    executesFetch();
  }, [executesFetch]);

  const refetch = useCallback(() => {
    executesFetch();
  }, [executesFetch]);

  return { data, loading, error, refetch };
};
