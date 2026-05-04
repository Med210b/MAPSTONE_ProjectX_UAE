import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'AED' | 'USD' | 'EUR';
export type UnitSystem = 'sqft' | 'sqm';

interface PreferencesContextType {
  currency: Currency;
  unitSystem: UnitSystem;
  setCurrency: (c: Currency) => void;
  setUnitSystem: (u: UnitSystem) => void;
  formatPrice: (aedValue: number | undefined) => string;
  formatArea: (sqFtValue: number | undefined) => string;
}

const CONVERSION_RATES = {
  USD: 0.2723,
  EUR: 0.2541,
  AED: 1
};

const UNIT_CONVERSION = {
  sqft: 1,
  sqm: 0.092903
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('pref_currency') as Currency) || 'AED';
  });
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    return (localStorage.getItem('pref_unit') as UnitSystem) || 'sqft';
  });

  useEffect(() => {
    localStorage.setItem('pref_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('pref_unit', unitSystem);
  }, [unitSystem]);

  const formatPrice = (aedValue: number | undefined): string => {
    if (aedValue === undefined) return 'Price on Request';
    const converted = aedValue * CONVERSION_RATES[currency];
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  const formatArea = (sqFtValue: number | undefined): string => {
    if (sqFtValue === undefined) return '';
    const converted = sqFtValue * UNIT_CONVERSION[unitSystem];
    const unitLabel = unitSystem === 'sqft' ? 'Sq/ft' : 'Sq/m';
    
    return `${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(converted)} ${unitLabel}`;
  };

  return (
    <PreferencesContext.Provider value={{ currency, unitSystem, setCurrency, setUnitSystem, formatPrice, formatArea }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
