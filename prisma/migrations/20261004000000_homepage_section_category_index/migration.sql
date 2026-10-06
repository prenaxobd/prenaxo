SET @homepage_section_category_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'homepagesection'
    AND index_name = 'HomepageSection_categoryId_idx'
);

SET @homepage_section_category_index_sql = IF(
  @homepage_section_category_index_exists = 0,
  'CREATE INDEX `HomepageSection_categoryId_idx` ON `homepagesection` (`categoryId`)',
  'SELECT 1'
);

PREPARE homepage_section_category_index_statement FROM @homepage_section_category_index_sql;
EXECUTE homepage_section_category_index_statement;
DEALLOCATE PREPARE homepage_section_category_index_statement;
