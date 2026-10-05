'use client';

import { createContext, useContext, useState } from 'react';

const ProductOptionContext = createContext(null);

export function ProductOptionProvider({ children }) {
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = useState([]);

  return (
    <ProductOptionContext.Provider value={{ selectedAttributeValueIds, setSelectedAttributeValueIds }}>
      {children}
    </ProductOptionContext.Provider>
  );
}

export function useProductOptionSelection() {
  return useContext(ProductOptionContext);
}
