ALTER TABLE `Banner`
  ADD COLUMN `desktopImage` VARCHAR(191) NULL,
  ADD COLUMN `mobileImage` VARCHAR(191) NULL,
  ADD COLUMN `buttonText` VARCHAR(191) NULL,
  ADD COLUMN `startAt` DATETIME(3) NULL,
  ADD COLUMN `endAt` DATETIME(3) NULL;

CREATE TABLE `HomepageSection` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` VARCHAR(191) NULL,
  `eyebrow` VARCHAR(191) NULL,
  `href` VARCHAR(191) NULL,
  `categoryId` VARCHAR(191) NULL,
  `productLimit` INTEGER NOT NULL DEFAULT 8,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `HomepageSection_categoryId_idx` (`categoryId`),
  CONSTRAINT `HomepageSection_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;