ALTER TABLE `SiteSettings`
  ADD COLUMN `freeDeliveryThreshold` DECIMAL(10, 2) NOT NULL DEFAULT 2000;

ALTER TABLE `Order`
  ADD COLUMN `freeDelivery` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `deliveryDivision` VARCHAR(191) NULL,
  ADD COLUMN `deliveryDistrict` VARCHAR(191) NULL;

CREATE TABLE `DeliveryZone` (
  `id` VARCHAR(191) NOT NULL,
  `division` VARCHAR(191) NOT NULL,
  `district` VARCHAR(191) NOT NULL,
  `charge` DECIMAL(10, 2) NOT NULL,
  `estimatedDelivery` VARCHAR(191) NOT NULL DEFAULT '2–4 দিন',
  `insideDhaka` BOOLEAN NOT NULL DEFAULT false,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `settingsId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `DeliveryZone_district_key`(`district`),
  INDEX `DeliveryZone_settingsId_idx`(`settingsId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `DeliveryZone`
  ADD CONSTRAINT `DeliveryZone_settingsId_fkey` FOREIGN KEY (`settingsId`) REFERENCES `SiteSettings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
