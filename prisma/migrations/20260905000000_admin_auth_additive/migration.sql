-- Additive custom admin authentication structures. Existing data is preserved.

ALTER TABLE `User` ADD COLUMN `adminAuthRole` VARCHAR(32) NULL;

CREATE TABLE IF NOT EXISTS `AdminAuthSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `rememberMe` BOOLEAN NOT NULL DEFAULT false,
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` VARCHAR(512) NULL,
    `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `AdminAuthSession_tokenHash_key`(`tokenHash`),
    INDEX `AdminAuthSession_userId_revokedAt_idx`(`userId`, `revokedAt`),
    INDEX `AdminAuthSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `AdminAuthSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminPasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `AdminPasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `AdminPasswordResetToken_userId_usedAt_idx`(`userId`, `usedAt`),
    INDEX `AdminPasswordResetToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `AdminPasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminLoginThrottle` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `failures` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `AdminLoginThrottle_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SecurityEvent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `eventType` VARCHAR(64) NOT NULL,
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` VARCHAR(512) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `SecurityEvent_eventType_createdAt_idx`(`eventType`, `createdAt`),
    INDEX `SecurityEvent_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `SecurityEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;