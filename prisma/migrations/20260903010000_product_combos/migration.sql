-- Safe additive Combo Product migration.
-- This migration intentionally does not modify or remove existing columns, indexes, or rows.

ALTER TABLE `Product`
  ADD COLUMN `productType` ENUM('SINGLE', 'COMBO') NOT NULL DEFAULT 'SINGLE';

CREATE TABLE `ProductComboItem` (
  `id` VARCHAR(191) NOT NULL,
  `comboProductId` VARCHAR(191) NOT NULL,
  `includedProductId` VARCHAR(191) NOT NULL,
  `quantity` INTEGER NOT NULL DEFAULT 1,

  UNIQUE INDEX `ProductComboItem_comboProductId_includedProductId_key` (`comboProductId`(64), `includedProductId`(64)),
  INDEX `ProductComboItem_comboProductId_idx` (`comboProductId`),
  INDEX `ProductComboItem_includedProductId_idx` (`includedProductId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProductComboItem`
  ADD CONSTRAINT `ProductComboItem_comboProductId_fkey`
    FOREIGN KEY (`comboProductId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductComboItem_includedProductId_fkey`
    FOREIGN KEY (`includedProductId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
