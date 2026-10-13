'use client';

import { createContext, useContext, useState } from 'react';

const ProductOptionContext = createContext(null);

export function ProductOptionProvider({ children, defaultWeightVariantId = '' }) {
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = useState([]);
  const [selectedWeightVariantId, setSelectedWeightVariantId] = useState(defaultWeightVariantId);

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
