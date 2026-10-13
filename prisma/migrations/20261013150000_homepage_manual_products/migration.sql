ALTER TABLE `homepagesection`
  ADD COLUMN `useManualProducts` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `homepagesectionproduct` (
  `id` VARCHAR(191) NOT NULL,
  `sectionId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `homepagesectionproduct_sectionId_productId_key` (`sectionId`, `productId`),
  INDEX `homepagesectionproduct_sectionId_sortOrder_idx` (`sectionId`, `sortOrder`),
  INDEX `homepagesectionproduct_productId_idx` (`productId`),
  CONSTRAINT `homepagesectionproduct_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `homepagesection` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `homepagesectionproduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
