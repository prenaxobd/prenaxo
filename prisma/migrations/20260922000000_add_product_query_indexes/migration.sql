-- Additive query indexes for product filtering and ordered relation reads.
CREATE INDEX `Product_categoryId_active_idx` ON `product`(`categoryId`, `active`);
CREATE INDEX `Product_brandId_active_idx` ON `product`(`brandId`, `active`);
CREATE INDEX `ProductImage_productId_sortOrder_idx` ON `productimage`(`productId`, `sortOrder`);
CREATE INDEX `Review_productId_approved_createdAt_idx` ON `review`(`productId`, `approved`, `createdAt`);
