'use client';

import { createContext, useContext, useState } from 'react';

const ProductOptionContext = createContext(null);

export function ProductOptionProvider({ children }) {
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = useState([]);
  const [selectedWeightVariantId, setSelectedWeightVariantId] = useState('');

  return (
    <ProductOptionContext.Provider value={{
      selectedAttributeValueIds,
      setSelectedAttributeValueIds,
      selectedWeightVariantId,
      setSelectedWeightVariantId,
    }}>
      {children}
    </ProductOptionContext.Provider>
  );
}

export function useProductOptionSelection() {
  return useContext(ProductOptionContext);
}
