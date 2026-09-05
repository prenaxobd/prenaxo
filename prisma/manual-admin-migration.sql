-- DropIndex
DROP INDEX `CartItem_cartId_fkey` ON `cartitem`;

-- DropIndex
DROP INDEX `CartItem_productId_fkey` ON `cartitem`;

-- DropIndex
DROP INDEX `Category_parentId_fkey` ON `category`;

-- DropIndex
DROP INDEX `DeliveryZone_settingsId_idx` ON `deliveryzone`;

-- DropIndex
DROP INDEX `HomepageSection_categoryId_idx` ON `homepagesection`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- DropIndex
DROP INDEX `OrderItem_orderId_fkey` ON `orderitem`;

-- DropIndex
DROP INDEX `OrderItem_productId_fkey` ON `orderitem`;

-- DropIndex
DROP INDEX `Product_categoryId_fkey` ON `product`;

-- DropIndex
DROP INDEX `ProductImage_productId_fkey` ON `productimage`;

-- DropIndex
DROP INDEX `ProductVariant_productId_fkey` ON `productvariant`;

-- DropIndex
DROP INDEX `Review_productId_fkey` ON `review`;

-- DropIndex
DROP INDEX `Review_userId_fkey` ON `review`;

-- DropIndex
DROP INDEX `WishlistItem_productId_fkey` ON `wishlistitem`;

-- DropIndex
DROP INDEX `WishlistItem_wishlistId_fkey` ON `wishlistitem`;

-- AlterTable
ALTER TABLE `adminactivity` ADD COLUMN `metadata` JSON NULL;

-- AlterTable
ALTER TABLE `coupon` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `deliveryzone` DROP COLUMN `createdAt`,
    DROP COLUMN `settingsId`,
    DROP COLUMN `updatedAt`,
    ALTER COLUMN `estimatedDelivery` DROP DEFAULT;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `deliveryDistrict`,
    DROP COLUMN `deliveryDivision`,
    DROP COLUMN `freeDelivery`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `brandId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sitesettings` ADD COLUMN `canonicalUrl` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `facebookPixelId` VARCHAR(191) NULL,
    ADD COLUMN `googleAnalyticsId` VARCHAR(191) NULL,
    ADD COLUMN `googleSearchConsoleVerification` VARCHAR(191) NULL,
    ADD COLUMN `keywords` JSON NULL,
    ADD COLUMN `metaDescription` VARCHAR(191) NULL,
    ADD COLUMN `metaTitle` VARCHAR(191) NULL,
    ADD COLUMN `ogDescription` VARCHAR(191) NULL,
    ADD COLUMN `ogImage` VARCHAR(191) NULL,
    ADD COLUMN `ogTitle` VARCHAR(191) NULL,
    ADD COLUMN `tikTokPixelId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Brand_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSEO` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `focusKeyword` VARCHAR(191) NULL,
    `secondaryKeywords` JSON NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `robotsIndex` ENUM('INDEX', 'NOINDEX') NOT NULL DEFAULT 'INDEX',
    `robotsFollow` ENUM('FOLLOW', 'NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
    `ogTitle` VARCHAR(191) NULL,
    `ogDescription` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `twitterTitle` VARCHAR(191) NULL,
    `twitterDescription` VARCHAR(191) NULL,
    `twitterImage` VARCHAR(191) NULL,
    `schemaType` VARCHAR(191) NULL DEFAULT 'Product',
    `schemaJson` JSON NULL,
    `seoScore` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductSEO_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategorySEO` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `focusKeyword` VARCHAR(191) NULL,
    `secondaryKeywords` JSON NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `robotsIndex` ENUM('INDEX', 'NOINDEX') NOT NULL DEFAULT 'INDEX',
    `robotsFollow` ENUM('FOLLOW', 'NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
    `ogTitle` VARCHAR(191) NULL,
    `ogDescription` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `schemaType` VARCHAR(191) NULL,
    `schemaJson` JSON NULL,
    `seoScore` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CategorySEO_categoryId_key`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BrandSEO` (
    `id` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `focusKeyword` VARCHAR(191) NULL,
    `secondaryKeywords` JSON NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `robotsIndex` ENUM('INDEX', 'NOINDEX') NOT NULL DEFAULT 'INDEX',
    `robotsFollow` ENUM('FOLLOW', 'NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
    `ogTitle` VARCHAR(191) NULL,
    `ogDescription` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `schemaType` VARCHAR(191) NULL,
    `schemaJson` JSON NULL,
    `seoScore` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BrandSEO_brandId_key`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NULL,
    `content` VARCHAR(191) NULL,
    `featuredImage` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageSEO` (
    `id` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `focusKeyword` VARCHAR(191) NULL,
    `secondaryKeywords` JSON NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `robotsIndex` ENUM('INDEX', 'NOINDEX') NOT NULL DEFAULT 'INDEX',
    `robotsFollow` ENUM('FOLLOW', 'NOFOLLOW') NOT NULL DEFAULT 'FOLLOW',
    `ogTitle` VARCHAR(191) NULL,
    `ogDescription` VARCHAR(191) NULL,
    `ogImage` VARCHAR(191) NULL,
    `twitterTitle` VARCHAR(191) NULL,
    `twitterDescription` VARCHAR(191) NULL,
    `twitterImage` VARCHAR(191) NULL,
    `schemaType` VARCHAR(191) NULL,
    `schemaJson` JSON NULL,
    `seoScore` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PageSEO_pageId_key`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redirect` (
    `id` VARCHAR(191) NOT NULL,
    `fromPath` VARCHAR(191) NOT NULL,
    `toPath` VARCHAR(191) NOT NULL,
    `type` ENUM('PERMANENT', 'TEMPORARY') NOT NULL DEFAULT 'PERMANENT',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `hitCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Redirect_fromPath_key`(`fromPath`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SEOAudit` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `issues` JSON NULL,
    `warnings` JSON NULL,
    `passed` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SEOAudit_url_idx`(`url`),
    INDEX `SEOAudit_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('DISCOUNT', 'FLASH_SALE', 'EMAIL', 'WHATSAPP', 'POPUP', 'BANNER', 'GENERAL') NOT NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `startAt` DATETIME(3) NULL,
    `endAt` DATETIME(3) NULL,
    `budget` DECIMAL(10, 2) NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED') NULL,
    `discountValue` DECIMAL(10, 2) NULL,
    `bannerImage` VARCHAR(191) NULL,
    `landingUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignProduct` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CampaignProduct_campaignId_productId_key`(`campaignId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerSegment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `rules` JSON NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerSegmentMember` (
    `id` VARCHAR(191) NOT NULL,
    `segmentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CustomerSegmentMember_segmentId_userId_key`(`segmentId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignSegmentMember` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `segmentId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CampaignSegmentMember_campaignId_segmentId_key`(`campaignId`, `segmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsletterSubscriber` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribedAt` DATETIME(3) NULL,

    UNIQUE INDEX `NewsletterSubscriber_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketingPopup` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `buttonText` VARCHAR(191) NULL,
    `buttonUrl` VARCHAR(191) NULL,
    `startAt` DATETIME(3) NULL,
    `endAt` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PAGE_VIEW', 'PRODUCT_VIEW', 'CATEGORY_VIEW', 'SEARCH', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'WISHLIST_ADD', 'WISHLIST_REMOVE', 'CHECKOUT_START', 'PURCHASE', 'LOGIN', 'SIGNUP') NOT NULL,
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

    INDEX `AnalyticsEvent_type_idx`(`type`),
    INDEX `AnalyticsEvent_createdAt_idx`(`createdAt`),
    INDEX `AnalyticsEvent_userId_idx`(`userId`),
    INDEX `AnalyticsEvent_productId_idx`(`productId`),
    INDEX `AnalyticsEvent_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIContent` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PRODUCT_DESCRIPTION', 'META_TITLE', 'META_DESCRIPTION', 'ALT_TEXT', 'CATEGORY_DESCRIPTION', 'BRAND_DESCRIPTION', 'BLOG', 'FAQ', 'SOCIAL_POST', 'AD_COPY', 'EMAIL', 'WHATSAPP', 'OTHER') NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `prompt` VARCHAR(191) NULL,
    `inputText` VARCHAR(191) NULL,
    `generatedText` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `applied` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AIContent_type_idx`(`type`),
    INDEX `AIContent_entityType_idx`(`entityType`),
    INDEX `AIContent_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIInsight` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SALES', 'PRODUCT', 'CUSTOMER', 'INVENTORY', 'SEO', 'MARKETING', 'GENERAL') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `data` JSON NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NULL,
    `dismissed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AIInsight_type_idx`(`type`),
    INDEX `AIInsight_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIAction` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `input` JSON NULL,
    `output` JSON NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'APPLIED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AIAction_status_idx`(`status`),
    INDEX `AIAction_entityType_idx`(`entityType`),
    INDEX `AIAction_entityId_idx`(`entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `AdminActivity_createdAt_idx` ON `AdminActivity`(`createdAt`);

-- CreateIndex
CREATE INDEX `AdminActivity_entity_idx` ON `AdminActivity`(`entity`);

-- CreateIndex
CREATE UNIQUE INDEX `Review_userId_productId_key` ON `Review`(`userId`, `productId`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_wishlistId_fkey` FOREIGN KEY (`wishlistId`) REFERENCES `Wishlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HomepageSection` ADD CONSTRAINT `HomepageSection_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminActivity` ADD CONSTRAINT `AdminActivity_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSEO` ADD CONSTRAINT `ProductSEO_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategorySEO` ADD CONSTRAINT `CategorySEO_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BrandSEO` ADD CONSTRAINT `BrandSEO_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PageSEO` ADD CONSTRAINT `PageSEO_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignProduct` ADD CONSTRAINT `CampaignProduct_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignProduct` ADD CONSTRAINT `CampaignProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSegmentMember` ADD CONSTRAINT `CustomerSegmentMember_segmentId_fkey` FOREIGN KEY (`segmentId`) REFERENCES `CustomerSegment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSegmentMember` ADD CONSTRAINT `CustomerSegmentMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignSegmentMember` ADD CONSTRAINT `CampaignSegmentMember_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignSegmentMember` ADD CONSTRAINT `CampaignSegmentMember_segmentId_fkey` FOREIGN KEY (`segmentId`) REFERENCES `CustomerSegment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIInsight` ADD CONSTRAINT `AIInsight_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `adminactivity` RENAME INDEX `AdminActivity_adminId_fkey` TO `AdminActivity_adminId_idx`;

