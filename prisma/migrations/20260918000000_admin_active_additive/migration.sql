-- Additive admin account state. Existing users remain intact and default to inactive admin access.
ALTER TABLE `User` ADD COLUMN `adminActive` BOOLEAN NOT NULL DEFAULT false;