ALTER TABLE `category`
    ADD COLUMN `enableWeightVariants` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `productvariant`
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `regularPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `salePrice` DECIMAL(10, 2) NULL;
