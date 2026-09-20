-- Preserve all user history while transitioning the legacy admin identity.

UPDATE `User`
SET `role` = 'ADMIN', `adminAuthRole` = 'main_admin', `adminActive` = true
WHERE LOWER(`email`) = 'prenaxo@gmail.com';