-- Khatibazar additive admin structures.
-- Review this file and take a backup before applying it. Run once per database.
-- This file intentionally contains no DROP, DELETE, TRUNCATE, or destructive ALTER.

ALTER TABLE `product` ADD COLUMN `brandId` VARCHAR(191) NULL;
ALTER TABLE `adminactivity` ADD COLUMN `metadata` JSON NULL;
ALTER TABLE `coupon` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `coupon` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `sitesettings` ADD COLUMN `metaTitle` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `metaDescription` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `keywords` JSON NULL;
ALTER TABLE `sitesettings` ADD COLUMN `canonicalUrl` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `ogTitle` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `ogDescription` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `ogImage` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `googleAnalyticsId` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `googleSearchConsoleVerification` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `facebookPixelId` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `tikTokPixelId` VARCHAR(191) NULL;
ALTER TABLE `sitesettings` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `sitesettings` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS `brand` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `logo` VARCHAR(191) NULL,
  `image` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `Brand_slug_key` (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `productseo` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `metaTitle` VARCHAR(191) NULL,
  `metaDescription` VARCHAR(191) NULL,
  `focusKeyword` VARCHAR(191) NULL,
  `secondaryKeywords` JSON NULL,
  `canonicalUrl` VARCHAR(191) NULL,
  `robotsIndex` ENUM('INDEX','NOINDEX') NOT NULL DEFAULT 'INDEX',
  `robotsFollow` ENUM('FOLLOW','NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
  `ogTitle` VARCHAR(191) NULL,
  `ogDescription` VARCHAR(191) NULL,
  `ogImage` VARCHAR(191) NULL,
  `twitterTitle` VARCHAR(191) NULL,
  `twitterDescription` VARCHAR(191) NULL,
  `twitterImage` VARCHAR(191) NULL,
  `schemaType` VARCHAR(191) NULL DEFAULT 'Product',
  `schemaJson` JSON NULL,
  `seoScore` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `ProductSEO_productId_key` (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categoryseo` (
  `id` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `metaTitle` VARCHAR(191) NULL,
  `metaDescription` VARCHAR(191) NULL,
  `focusKeyword` VARCHAR(191) NULL,
  `secondaryKeywords` JSON NULL,
  `canonicalUrl` VARCHAR(191) NULL,
  `robotsIndex` ENUM('INDEX','NOINDEX') NOT NULL DEFAULT 'INDEX',
  `robotsFollow` ENUM('FOLLOW','NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
  `ogTitle` VARCHAR(191) NULL,
  `ogDescription` VARCHAR(191) NULL,
  `ogImage` VARCHAR(191) NULL,
  `schemaType` VARCHAR(191) NULL,
  `schemaJson` JSON NULL,
  `seoScore` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `CategorySEO_categoryId_key` (`categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `brandseo` (
  `id` VARCHAR(191) NOT NULL,
  `brandId` VARCHAR(191) NOT NULL,
  `metaTitle` VARCHAR(191) NULL,
  `metaDescription` VARCHAR(191) NULL,
  `focusKeyword` VARCHAR(191) NULL,
  `secondaryKeywords` JSON NULL,
  `canonicalUrl` VARCHAR(191) NULL,
  `robotsIndex` ENUM('INDEX','NOINDEX') NOT NULL DEFAULT 'INDEX',
  `robotsFollow` ENUM('FOLLOW','NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
  `ogTitle` VARCHAR(191) NULL,
  `ogDescription` VARCHAR(191) NULL,
  `ogImage` VARCHAR(191) NULL,
  `schemaType` VARCHAR(191) NULL,
  `schemaJson` JSON NULL,
  `seoScore` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `BrandSEO_brandId_key` (`brandId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `excerpt` VARCHAR(191) NULL,
  `content` TEXT NULL,
  `featuredImage` VARCHAR(191) NULL,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `published` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `Page_slug_key` (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pageseo` (
  `id` VARCHAR(191) NOT NULL,
  `pageId` VARCHAR(191) NOT NULL,
  `metaTitle` VARCHAR(191) NULL,
  `metaDescription` VARCHAR(191) NULL,
  `focusKeyword` VARCHAR(191) NULL,
  `secondaryKeywords` JSON NULL,
  `canonicalUrl` VARCHAR(191) NULL,
  `robotsIndex` ENUM('INDEX','NOINDEX') NOT NULL DEFAULT 'INDEX',
  `robotsFollow` ENUM('FOLLOW','NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
  `ogTitle` VARCHAR(191) NULL,
  `ogDescription` VARCHAR(191) NULL,
  `ogImage` VARCHAR(191) NULL,
  `twitterTitle` VARCHAR(191) NULL,
  `twitterDescription` VARCHAR(191) NULL,
  `twitterImage` VARCHAR(191) NULL,
  `schemaType` VARCHAR(191) NULL,
  `schemaJson` JSON NULL,
  `seoScore` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `PageSEO_pageId_key` (`pageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `redirect` (
  `id` VARCHAR(191) NOT NULL,
  `fromPath` VARCHAR(191) NOT NULL,
  `toPath` VARCHAR(191) NOT NULL,
  `type` ENUM('PERMANENT','TEMPORARY') NOT NULL DEFAULT 'PERMANENT',
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `hitCount` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), UNIQUE KEY `Redirect_fromPath_key` (`fromPath`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `analyticsEvent` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('PAGE_VIEW','PRODUCT_VIEW','CATEGORY_VIEW','SEARCH','ADD_TO_CART','REMOVE_FROM_CART','WISHLIST_ADD','WISHLIST_REMOVE','CHECKOUT_START','PURCHASE','LOGIN','SIGNUP') NOT NULL,
  `userId` VARCHAR(191) NULL,
  `productId` VARCHAR(191) NULL,
  `categoryId` VARCHAR(191) NULL,
  `sessionId` VARCHAR(191) NULL,
  `path` VARCHAR(191) NULL,
  `referrer` VARCHAR(191) NULL,
  `source` VARCHAR(191) NULL,
  `medium` VARCHAR(191) NULL,
  `campaign` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), KEY `AnalyticsEvent_type_idx` (`type`), KEY `AnalyticsEvent_createdAt_idx` (`createdAt`), KEY `AnalyticsEvent_userId_idx` (`userId`), KEY `AnalyticsEvent_productId_idx` (`productId`), KEY `AnalyticsEvent_categoryId_idx` (`categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventorymovement` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantityChange` INT NOT NULL,
  `previousStock` INT NOT NULL,
  `newStock` INT NOT NULL,
  `reason` VARCHAR(191) NULL,
  `type` VARCHAR(191) NOT NULL,
  `adminId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), KEY `InventoryMovement_productId_idx` (`productId`), KEY `InventoryMovement_createdAt_idx` (`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add this FK only after confirming it is absent in information_schema.
-- It is intentionally separate because existing installations have schema drift:
-- ALTER TABLE `product` ADD CONSTRAINT `Product_brandId_fkey`
--   FOREIGN KEY (`brandId`) REFERENCES `brand` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
-- ALTER TABLE `inventorymovement` ADD CONSTRAINT `InventoryMovement_productId_fkey`
--   FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- ALTER TABLE `inventorymovement` ADD CONSTRAINT `InventoryMovement_adminId_fkey`
--   FOREIGN KEY (`adminId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
