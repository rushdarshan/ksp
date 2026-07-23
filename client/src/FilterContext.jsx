import { createContext, useContext, useState, useCallback } from 'react';

const FilterContext = createContext(null);

export const useFilter = () => useContext(FilterContext);

export const FILTER_KEYS = ['station', 'dateFrom', 'dateTo', 'crimeType'];

const emptyFilters = () => Object.fromEntries(FILTER_KEYS.map(k => [k, null]));

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(emptyFilters);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || null }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(emptyFilters());
  }, []);

  const activeFilters = FILTER_KEYS.filter(k => filters[k]);

  return (
    <FilterContext.Provider value={{ ...filters, setFilter, clearFilters, activeFilters }}>
      {children}
    </FilterContext.Provider>
  );
};
