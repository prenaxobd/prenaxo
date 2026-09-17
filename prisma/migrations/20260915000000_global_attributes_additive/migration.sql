-- Additive global attribute tables only; existing app data is preserved.

CREATE TABLE IF NOT EXISTS `Attribute` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'TEXT',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Attribute_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AttributeValue` (
    `id` VARCHAR(191) NOT NULL,
    `attributeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `hexValue` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `AttributeValue_attributeId_slug_key`(`attributeId`(64), `slug`(64)),
    INDEX `AttributeValue_attributeId_active_idx`(`attributeId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CategoryAttribute` (
    `categoryId` VARCHAR(191) NOT NULL,
    `attributeId` VARCHAR(191) NOT NULL,

    INDEX `CategoryAttribute_attributeId_idx`(`attributeId`),
    PRIMARY KEY (`categoryId`(64), `attributeId`(64))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductAttributeValue` (
    `productId` VARCHAR(191) NOT NULL,
    `attributeValueId` VARCHAR(191) NOT NULL,

    INDEX `ProductAttributeValue_attributeValueId_idx`(`attributeValueId`),
    PRIMARY KEY (`productId`(64), `attributeValueId`(64))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductVariantAttributeValue` (
    `variantId` VARCHAR(191) NOT NULL,
    `attributeValueId` VARCHAR(191) NOT NULL,

    INDEX `ProductVariantAttributeValue_attributeValueId_idx`(`attributeValueId`),
    PRIMARY KEY (`variantId`(64), `attributeValueId`(64))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AttributeValue`
    ADD CONSTRAINT `AttributeValue_attributeId_fkey`
    FOREIGN KEY (`attributeId`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CategoryAttribute`
    ADD CONSTRAINT `CategoryAttribute_categoryId_fkey`
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `CategoryAttribute_attributeId_fkey`
    FOREIGN KEY (`attributeId`) REFERENCES `Attribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductAttributeValue`
    ADD CONSTRAINT `ProductAttributeValue_productId_fkey`
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `ProductAttributeValue_attributeValueId_fkey`
    FOREIGN KEY (`attributeValueId`) REFERENCES `AttributeValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductVariantAttributeValue`
    ADD CONSTRAINT `ProductVariantAttributeValue_variantId_fkey`
    FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `ProductVariantAttributeValue_attributeValueId_fkey`
    FOREIGN KEY (`attributeValueId`) REFERENCES `AttributeValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing cart rows while allowing one line per product variant.
DROP INDEX `CartItem_cartId_productId_key` ON `CartItem`;
CREATE UNIQUE INDEX `CartItem_cartId_productId_variantId_key` ON `CartItem`(`cartId`(64), `productId`(64), `variantId`(64));

ALTER TABLE `CartItem`
    ADD CONSTRAINT `CartItem_variantId_fkey`
    FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
    ADD COLUMN `variantId` VARCHAR(191) NULL,
    ADD COLUMN `variantLabel` VARCHAR(191) NULL,
    ADD CONSTRAINT `OrderItem_variantId_fkey`
    FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
