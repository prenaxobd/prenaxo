-- Preserve existing cart and order data while storing selected global attribute values.
SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE `CartItem` ADD COLUMN `attributeValueIds` JSON NULL',
        'SELECT 1')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'CartItem' AND column_name = 'attributeValueIds'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE `CartItem` ADD COLUMN `attributeSelectionKey` VARCHAR(191) NOT NULL DEFAULT ''''',
        'SELECT 1')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'CartItem' AND column_name = 'attributeSelectionKey'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) > 0,
        'DROP INDEX `CartItem_cartId_productId_variantId_key` ON `CartItem`',
        'SELECT 1')
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'CartItem' AND index_name = 'CartItem_cartId_productId_variantId_key'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'CREATE UNIQUE INDEX `CartItem_cartId_productId_variantId_attributeSelectionKey_key` ON `CartItem`(`cartId`(32), `productId`(32), `variantId`(32), `attributeSelectionKey`(128))',
        'SELECT 1')
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'CartItem' AND index_name = 'CartItem_cartId_productId_variantId_attributeSelectionKey_key'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT IF(COUNT(*) = 0,
        'ALTER TABLE `OrderItem` ADD COLUMN `attributeValueIds` JSON NULL',
        'SELECT 1')
    FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'OrderItem' AND column_name = 'attributeValueIds'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;