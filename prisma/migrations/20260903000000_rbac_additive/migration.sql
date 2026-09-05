-- Additive RBAC tables only; existing app data is preserved.

CREATE TABLE IF NOT EXISTS `AdminPermission` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,
    `module` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminPermission_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminRole` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminRole_name_key`(`name`),
    UNIQUE INDEX `AdminRole_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminRolePermission` (
    `id` VARCHAR(191) NOT NULL,
    `adminRoleId` VARCHAR(64) NOT NULL,
    `permissionId` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `AdminRolePermission_adminRoleId_permissionId_key`(`adminRoleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminUserRole` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(64) NOT NULL,
    `adminRoleId` VARCHAR(64) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminUserRole_userId_adminRoleId_key`(`userId`, `adminRoleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AdminRolePermission`
    ADD CONSTRAINT `AdminRolePermission_adminRoleId_fkey`
    FOREIGN KEY (`adminRoleId`) REFERENCES `AdminRole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AdminRolePermission`
    ADD CONSTRAINT `AdminRolePermission_permissionId_fkey`
    FOREIGN KEY (`permissionId`) REFERENCES `AdminPermission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AdminUserRole`
    ADD CONSTRAINT `AdminUserRole_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AdminUserRole`
    ADD CONSTRAINT `AdminUserRole_adminRoleId_fkey`
    FOREIGN KEY (`adminRoleId`) REFERENCES `AdminRole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
