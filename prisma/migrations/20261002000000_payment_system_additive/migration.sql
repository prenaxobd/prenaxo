ALTER TABLE `order`
  MODIFY `paymentStatus` ENUM('PENDING', 'PENDING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE `paymentmethod`
  ADD COLUMN `type` ENUM('COD', 'BANK_TRANSFER', 'MANUAL_WALLET', 'GATEWAY') NOT NULL DEFAULT 'MANUAL_WALLET',
  ADD COLUMN `logoUrl` VARCHAR(512) NULL,
  ADD COLUMN `requiresTransactionId` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `gatewayProvider` VARCHAR(32) NULL,
  ADD COLUMN `gatewayChannel` VARCHAR(64) NULL;

UPDATE `paymentmethod`
SET `type` = CASE WHEN `code` = 'COD' THEN 'COD' WHEN `code` = 'BANK' THEN 'BANK_TRANSFER' ELSE 'MANUAL_WALLET' END,
    `requiresTransactionId` = CASE WHEN `code` IN ('BKASH', 'NAGAD') THEN true ELSE false END,
    `logoUrl` = CASE
      WHEN `code` = 'BKASH' THEN 'https://res.cloudinary.com/ethp0qrs/image/upload/v1790904746/bkash-logo-horizontal-bangla-mobile-banking-app-icon-free-png.png'
      WHEN `code` = 'NAGAD' THEN 'https://res.cloudinary.com/ethp0qrs/image/upload/v1790904660/Nagad-Logo.wine.png'
      ELSE `logoUrl`
    END;

INSERT INTO `paymentmethod` (`id`, `code`, `name`, `type`, `description`, `logoUrl`, `requiresTransactionId`, `accountNumber`, `accountName`, `bankName`, `branchName`, `routingNumber`, `instructions`, `active`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT 'default_payment_rocket', 'ROCKET', 'Rocket', 'MANUAL_WALLET', 'Send money using Rocket and enter your transaction ID.', 'https://res.cloudinary.com/ethp0qrs/image/upload/v1790905387/rocket-color-logo-mobile-banking-icon-free-png.png', true, NULL, NULL, NULL, NULL, NULL, 'Add the Rocket account number in admin settings before enabling this method.', false, 4, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `paymentmethod` WHERE `code` = 'ROCKET');

INSERT INTO `paymentmethod` (`id`, `code`, `name`, `type`, `description`, `logoUrl`, `requiresTransactionId`, `gatewayProvider`, `gatewayChannel`, `instructions`, `active`, `sortOrder`, `createdAt`, `updatedAt`)
SELECT 'default_payment_sslcommerz', 'SSLCOMMERZ', 'Online payment', 'GATEWAY', 'Pay securely through the hosted payment page.', NULL, false, 'SSLCOMMERZ', NULL, 'You will be redirected to the secure payment page.', false, 10, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
WHERE NOT EXISTS (SELECT 1 FROM `paymentmethod` WHERE `code` = 'SSLCOMMERZ');

CREATE TABLE `paymentattempt` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `paymentMethodId` VARCHAR(191) NULL,
  `methodCode` VARCHAR(32) NOT NULL,
  `provider` VARCHAR(32) NOT NULL,
  `checkoutLockUserId` VARCHAR(191) NULL,
  `merchantTransactionId` VARCHAR(64) NOT NULL,
  `providerSessionKey` VARCHAR(64) NULL,
  `providerTransactionId` VARCHAR(128) NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'BDT',
  `status` ENUM('CREATED', 'PENDING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
  `inventoryReserved` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `paymentattempt_merchantTransactionId_key` (`merchantTransactionId`),
  UNIQUE INDEX `paymentattempt_providerSessionKey_key` (`providerSessionKey`),
  UNIQUE INDEX `paymentattempt_providerTransactionId_key` (`providerTransactionId`),
  UNIQUE INDEX `paymentattempt_checkoutLockUserId_key` (`checkoutLockUserId`),
  INDEX `paymentattempt_orderId_status_idx` (`orderId`, `status`),
  INDEX `paymentattempt_paymentMethodId_idx` (`paymentMethodId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `paymentevent` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `actorId` VARCHAR(191) NULL,
  `status` ENUM('PENDING', 'PENDING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED') NOT NULL,
  `source` ENUM('SYSTEM', 'ADMIN', 'GATEWAY') NOT NULL DEFAULT 'SYSTEM',
  `note` TEXT NULL,
  `externalReference` VARCHAR(128) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `paymentevent_orderId_createdAt_idx` (`orderId`, `createdAt`),
  INDEX `paymentevent_actorId_createdAt_idx` (`actorId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;