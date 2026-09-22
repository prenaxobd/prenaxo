-- Additive query indexes for product filtering and ordered relation reads.
CREATE INDEX `Product_categoryId_active_idx` ON `Product`(`categoryId`, `active`);
CREATE INDEX `Product_brandId_active_idx` ON `Product`(`brandId`, `active`);
CREATE INDEX `ProductImage_productId_sortOrder_idx` ON `ProductImage`(`productId`, `sortOrder`);
CREATE INDEX `Review_productId_approved_createdAt_idx` ON `Review`(`productId`, `approved`, `createdAt`);
