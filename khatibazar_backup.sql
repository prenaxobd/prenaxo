-- MySQL dump 10.13  Distrib 8.4.7, for Win64 (x86_64)
--
-- Host: localhost    Database: khatibazar
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('cee1e2ce-54a8-4fd8-8a51-d90529668c16','9fa2d53fbb07937abebc722566495be23b7679d842d3d2ecf92d013e15511cda',NULL,'20260824061309_init','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260824061309_init\n\nDatabase error code: 1071\n\nDatabase error:\nSpecified key was too long; max key length is 1000 bytes\n\nPlease check the query number 7 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20260824061309_init\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20260824061309_init\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260','2026-08-24 06:15:19.819','2026-08-24 06:13:09.507',0),('4ea4111e-8bd8-434a-a92f-680eeb7ad623','dcdc570c6e21ab5ac403199ceef62e2a464f00fe14b5acddbbce47073f5f310b','2026-08-24 06:18:35.717','20260824061309_init','',NULL,'2026-08-24 06:18:35.717',0),('34a702fc-f1b7-4fe5-9f0d-0a370fb1bb6a','6e12a99a4d53872adb16ef6d316ffe1c02861c08e575ea05193d976c9eef70fb','2026-08-24 10:02:06.495','20260824120000_delivery_zones',NULL,NULL,'2026-08-24 10:02:06.222',1),('513b02e5-384e-4e40-8bcc-68035ebfd7b9','2eb50a405dfdbf4292fc7caabb02edbe50d5314d04c1274c34babecaf2d3ca01','2026-08-26 17:58:13.264','20260826160000_homepage_content',NULL,NULL,'2026-08-26 17:58:13.141',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adminactivity`
--

DROP TABLE IF EXISTS `adminactivity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adminactivity` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adminId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `AdminActivity_adminId_fkey` (`adminId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminactivity`
--

LOCK TABLES `adminactivity` WRITE;
/*!40000 ALTER TABLE `adminactivity` DISABLE KEYS */;
/*!40000 ALTER TABLE `adminactivity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banner`
--

DROP TABLE IF EXISTS `banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banner` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '0',
  `desktopImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobileImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buttonText` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startAt` datetime(3) DEFAULT NULL,
  `endAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banner`
--

LOCK TABLES `banner` WRITE;
/*!40000 ALTER TABLE `banner` DISABLE KEYS */;
INSERT INTO `banner` VALUES ('welcome-banner','আলোকিত করুন আপনার ঘর প্রিমিয়াম ল্যাম্প কালেকশন','ইসলামিক, নেচার, লাভ, মডার্ন ও ডেকোরেটিভ—সব ধরনের প্রিমিয়াম ল্যাম্প এক জায়গায়। আপনার পছন্দের আলোয় সাজিয়ে তুলুন ঘর, অফিস কিংবা প্রিয় উপহারের মুহূর্ত।','/uploads/0dc6a8fa-651f-4ad2-952a-0df46505d67f.png','/category/lamp-light',1,-2,NULL,NULL,NULL,NULL,NULL),('cmt84uiez0001ta0wisnm7l43','Premium lamp','this is wall lamp','/uploads/7871699a-e473-4799-b96f-16218d4f4516.webp','/shop/',0,0,NULL,NULL,NULL,NULL,NULL),('cmtaxqpqw000ctaygwaphm6r2','.........','.','/uploads/24e45410-eeca-4d14-9b61-e26149b1f2dd.jpg','/shop',1,0,NULL,NULL,NULL,NULL,NULL),('cmtaxsqgz000dtaygifm58bqx','.....................','..','/uploads/bc662014-3bff-4bac-ba8d-d5ba336bf829.jpg','/category/lamp-light',0,0,NULL,NULL,NULL,NULL,NULL),('cmtaxtlu8000etaygf9k6mot3','............','.','/uploads/9f0a832e-dc76-4d0c-892e-3f40b284be7a.jpg','/shop',0,0,NULL,NULL,NULL,NULL,NULL),('cmtaxu8gu000ftaygofjfd0bn','...........','','/uploads/3c9fd29e-53c1-4595-a4cb-36cc4a3aff22.jpg','/shop',1,0,NULL,NULL,NULL,NULL,NULL),('cmtaxvh2c000gtaygx708t6j0','..............','.','/uploads/519bbe05-ef13-46d8-92ad-b2fef05f87cc.jpg','/shop/',1,0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `banner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cart_userId_key` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES ('cmt705f4x0001taigqzp97gyw','cmt6uigum0000tapkm0l9rodd','2026-08-24 08:56:53.985'),('cmta6c19q0002tajs5sr83hnc','cmta6c0he0000tajsdjk2f53r','2026-08-26 14:13:18.829'),('cmta8xc8s0002ta3sxhlxzwa4','cmta8fejf0000ta3snv49dc88','2026-08-26 15:25:52.057'),('cmta9tlo50002tad8hviw3hr3','cmta9tkv30000tad8w5fxl4jj','2026-08-26 15:50:57.269'),('cmtih6lon0001tac4k3185tqc','cmthdkpcr0000tapczrp73466','2026-09-01 09:39:10.529');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartitem`
--

DROP TABLE IF EXISTS `cartitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `cartId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CartItem_cartId_productId_key` (`cartId`(64),`productId`(64)),
  KEY `CartItem_cartId_fkey` (`cartId`),
  KEY `CartItem_productId_fkey` (`productId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartitem`
--

LOCK TABLES `cartitem` WRITE;
/*!40000 ALTER TABLE `cartitem` DISABLE KEYS */;
INSERT INTO `cartitem` VALUES ('cmta6ifnc0011tajs524211hh',1,'cmta6c19q0002tajs5sr83hnc','cmta4f3gg000qtal44lf0k54b',NULL),('cmta6ih340015tajs98m54tx7',1,'cmta6c19q0002tajs5sr83hnc','cmt85k3z3000fta0wf74gednf',NULL),('cmta9wk08000otad84qjptrea',1,'cmta9tlo50002tad8hviw3hr3','cmta4f3gg000qtal44lf0k54b',NULL),('cmtb6elwh0048tayg2168ugb5',1,'cmta8xc8s0002ta3sxhlxzwa4','cmtb5y4k6003htayg11miuzcl',NULL),('cmtb6ekn60044taygeixqbf1f',1,'cmta8xc8s0002ta3sxhlxzwa4','cmtb6c9s8003ztayg4c58d31x',NULL);
/*!40000 ALTER TABLE `cartitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_slug_key` (`slug`),
  KEY `Category_parentId_fkey` (`parentId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('cmt6uigvy0001tapktkgfyi6z','Fresh pantry','fresh-pantry',NULL,'/uploads/e769e4fb-f679-4bf4-8ba8-f8a1336bb09f.webp',1,NULL,'2026-08-24 06:19:05.087'),('cmt6uigw60002tapk1qv6s60j','Home & living','home-living',NULL,'/uploads/6ae38973-81da-497c-96dd-4aa71dc99b21.png',1,NULL,'2026-08-24 06:19:05.095'),('cmt6uigwb0003tapksy0dkry3','Personal care','personal-care',NULL,'/uploads/83d65e88-591f-46c5-a11f-c6939896ecdb.jpg',1,NULL,'2026-08-24 06:19:05.100'),('cmt6uigwf0004tapkln16qv6j','Stationery','stationery',NULL,'/uploads/09803b06-9e51-43d8-8785-ded31e80b00c.jpg',1,NULL,'2026-08-24 06:19:05.103'),('cmt84gl5o0000ta0w1vpsk9a4','Lamp Light','lamp-light','','/uploads/e6b9b41a-2c7f-458a-85f4-12de2cd0dcb4.jpg',1,NULL,'2026-08-25 03:45:19.642'),('cmtb5tu4t003ctaygwfge58hl','Honey Nuts ','honey-nuts ','','/uploads/a0c7fbca-e67e-456f-82df-016839382cfe.png',1,NULL,'2026-08-27 06:46:55.948'),('cmtb9qyl30000ta5stsyzg37c','Honey','honey','','/uploads/c858ade5-ea6d-4c32-b327-6ae800fbbcd9.png',1,NULL,'2026-08-27 08:36:40.214');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon`
--

DROP TABLE IF EXISTS `coupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('PERCENTAGE','FIXED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `minimumOrder` decimal(10,2) DEFAULT NULL,
  `expiresAt` datetime(3) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Coupon_code_key` (`code`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon`
--

LOCK TABLES `coupon` WRITE;
/*!40000 ALTER TABLE `coupon` DISABLE KEYS */;
INSERT INTO `coupon` VALUES ('cmt6unmto000dta80fq7rw8m3','KHATI10','PERCENTAGE',10.00,500.00,NULL,1);
/*!40000 ALTER TABLE `coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveryzone`
--

DROP TABLE IF EXISTS `deliveryzone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveryzone` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `division` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `charge` decimal(10,2) NOT NULL,
  `estimatedDelivery` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2–4 দিন',
  `insideDhaka` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `settingsId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DeliveryZone_district_key` (`district`),
  KEY `DeliveryZone_settingsId_idx` (`settingsId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveryzone`
--

LOCK TABLES `deliveryzone` WRITE;
/*!40000 ALTER TABLE `deliveryzone` DISABLE KEYS */;
INSERT INTO `deliveryzone` VALUES ('cmt72jdo2000ftatchlp7g5t3','ঢাকা','ঢাকা',60.00,'2–4 দিন',1,1,'default-settings','2026-08-24 10:03:44.498','2026-08-24 10:06:39.300'),('cmt72jdo8000htatcylzsv8zy','ঢাকা','গাজীপুর',80.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.504','2026-08-24 10:06:39.307'),('cmt72jdoe000jtatcohm1u0ad','ঢাকা','নারায়ণগঞ্জ',80.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.511','2026-08-24 10:06:39.312'),('cmt72jdoi000ltatc6gpzfrhz','ঢাকা','কিশোরগঞ্জ',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.514','2026-08-24 10:06:39.315'),('cmt72jdom000ntatc6lclpyxo','ঢাকা','মাদারীপুর',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.518','2026-08-25 03:44:51.602'),('cmt72jdoq000ptatc5ravpl9e','ঢাকা','মানিকগঞ্জ',90.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.522','2026-08-24 10:06:39.324'),('cmt72jdov000rtatcqbq57m0k','ঢাকা','মুন্সিগঞ্জ',90.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.527','2026-08-24 10:06:39.329'),('cmt72jdoz000ttatc7tnydfx1','ঢাকা','নরসিংদী',90.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.531','2026-08-24 10:06:39.332'),('cmt72jdp3000vtatc5uc8bj1p','ঢাকা','রাজবাড়ী',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.535','2026-08-24 10:06:39.336'),('cmt72jdp7000xtatcjtghq4oy','ঢাকা','শরীয়তপুর',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.539','2026-08-24 10:06:39.341'),('cmt72jdpc000ztatcyuh0gerp','ঢাকা','টাঙ্গাইল',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.544','2026-08-24 10:06:39.345'),('cmt72jdpg0011tatcgy12zqdv','বরিশাল','বরগুনা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.548','2026-08-24 10:06:39.349'),('cmt72jdpk0013tatcj4w2hudq','বরিশাল','বরিশাল',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.552','2026-08-24 10:06:39.353'),('cmt72jdpo0015tatcvtn14nih','বরিশাল','ভোলা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.556','2026-08-24 10:06:39.357'),('cmt72jdpt0017tatc4un8q3gb','বরিশাল','ঝালকাঠি',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.562','2026-08-24 10:06:39.362'),('cmt72jdpx0019tatcw6riosj0','বরিশাল','পটুয়াখালী',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.565','2026-08-24 10:06:39.366'),('cmt72jdq1001btatcfc0fsgcn','বরিশাল','পিরোজপুর',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.569','2026-08-24 10:06:39.371'),('cmt72jdq5001dtatcpw3zl7se','চট্টগ্রাম','বান্দরবান',140.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.574','2026-08-24 10:06:39.376'),('cmt72jdqa001ftatcvj0s575t','চট্টগ্রাম','ব্রাহ্মণবাড়িয়া',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.578','2026-08-24 10:06:39.380'),('cmt72jdqe001htatcwx6uhqrg','চট্টগ্রাম','চাঁদপুর',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.582','2026-08-24 10:06:39.384'),('cmt72jdqi001jtatcom02spt3','চট্টগ্রাম','চট্টগ্রাম',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.586','2026-08-24 10:06:39.389'),('cmt72jdqm001ltatc10qoauak','চট্টগ্রাম','কুমিল্লা',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.590','2026-08-24 10:06:39.394'),('cmt72jdqr001ntatcs16uplno','চট্টগ্রাম','কক্সবাজার',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.595','2026-08-24 10:06:39.398'),('cmt72jdqv001ptatc5h6bkebw','চট্টগ্রাম','ফেনী',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.599','2026-08-24 10:06:39.402'),('cmt72jdqz001rtatc0yz2ayx7','চট্টগ্রাম','খাগড়াছড়ি',140.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.603','2026-08-24 10:06:39.407'),('cmt72jdr3001ttatcqbzbtf9r','চট্টগ্রাম','লক্ষ্মীপুর',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.608','2026-08-24 10:06:39.412'),('cmt72jdr8001vtatcs51fxkdr','চট্টগ্রাম','নোয়াখালী',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.612','2026-08-24 10:06:39.416'),('cmt72jdrc001xtatc7ko28pvb','চট্টগ্রাম','রাঙ্গামাটি',140.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.616','2026-08-24 10:06:39.420'),('cmt72jdrh001ztatca1ryzkgz','খুলনা','বাগেরহাট',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.621','2026-08-24 10:06:39.426'),('cmt72jdrm0021tatc6ivny80a','খুলনা','চুয়াডাঙ্গা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.626','2026-08-24 10:06:39.430'),('cmt72jdrq0023tatcf3wyggoy','খুলনা','যশোর',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.631','2026-08-24 10:06:39.435'),('cmt72jdrv0025tatcp0d98jyc','খুলনা','ঝিনাইদহ',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.635','2026-08-24 10:06:39.440'),('cmt72jdrz0027tatc607ck4kr','খুলনা','খুলনা',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.639','2026-08-24 10:06:39.446'),('cmt72jds40029tatcz1jy4b5s','খুলনা','কুষ্টিয়া',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.644','2026-08-24 10:06:39.450'),('cmt72jds8002btatc8cinlbo5','খুলনা','মাগুরা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.648','2026-08-24 10:06:39.454'),('cmt72jdsc002dtatceydtjzkp','খুলনা','মেহেরপুর',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.652','2026-08-24 10:06:39.458'),('cmt72jdsg002ftatcwf9tx72l','খুলনা','নড়াইল',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.656','2026-08-24 10:06:39.462'),('cmt72jdsl002htatck4l1j6b3','খুলনা','সাতক্ষীরা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.661','2026-08-24 10:06:39.467'),('cmt72jdsp002jtatcb0prr89i','ময়মনসিংহ','জামালপুর',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.665','2026-08-24 10:06:39.472'),('cmt72jdst002ltatcz9kp9xog','ময়মনসিংহ','ময়মনসিংহ',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.669','2026-08-24 10:06:39.477'),('cmt72jdsx002ntatcp1a2rdk9','ময়মনসিংহ','নেত্রকোনা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.673','2026-08-24 10:06:39.481'),('cmt72jdt1002ptatcd84bsh5o','ময়মনসিংহ','শেরপুর',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.678','2026-08-24 10:06:39.485'),('cmt72jdt5002rtatcgo5r03vh','রাজশাহী','বগুড়া',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.682','2026-08-24 10:06:39.491'),('cmt72jdt9002ttatcjappheo0','রাজশাহী','জয়পুরহাট',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.685','2026-08-24 10:06:39.495'),('cmt72jdtd002vtatckq2x28y1','রাজশাহী','নওগাঁ',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.689','2026-08-24 10:06:39.499'),('cmt72jdti002xtatc4bnev4hr','রাজশাহী','নাটোর',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.694','2026-08-24 10:06:39.503'),('cmt72jdtm002ztatckaozixnu','রাজশাহী','চাঁপাইনবাবগঞ্জ',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.698','2026-08-24 10:06:39.508'),('cmt72jdtq0031tatc369lxbym','রাজশাহী','পাবনা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.702','2026-08-24 10:06:39.512'),('cmt72jdtu0033tatczod4h5gn','রাজশাহী','রাজশাহী',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.706','2026-08-24 10:06:39.516'),('cmt72jdtz0035tatc2i5s6jgr','রাজশাহী','সিরাজগঞ্জ',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.711','2026-08-24 10:06:39.521'),('cmt72jdu30037tatc9327gcu8','রংপুর','দিনাজপুর',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.715','2026-08-24 10:06:39.526'),('cmt72jdu60039tatclrv1710j','রংপুর','গাইবান্ধা',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.719','2026-08-24 10:06:39.530'),('cmt72jdug003btatch2rpz4lx','রংপুর','কুড়িগ্রাম',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.728','2026-08-24 10:06:39.534'),('cmt72jduj003dtatcer5hguoo','রংপুর','লালমনিরহাট',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.732','2026-08-24 10:06:39.539'),('cmt72jdun003ftatc362u84ac','রংপুর','নীলফামারী',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.736','2026-08-24 10:06:39.544'),('cmt72jdus003htatcq4swua8y','রংপুর','পঞ্চগড়',140.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.740','2026-08-24 10:06:39.548'),('cmt72jduw003jtatcv09urqzq','রংপুর','রংপুর',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.745','2026-08-24 10:06:39.552'),('cmt72jdv0003ltatc816hox3n','রংপুর','ঠাকুরগাঁও',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.748','2026-08-24 10:06:39.557'),('cmt72jdv4003ntatcabius9ba','সিলেট','হবিগঞ্জ',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.752','2026-08-24 10:06:39.561'),('cmt72jdv8003ptatcf0hyjd9i','সিলেট','মৌলভীবাজার',120.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.756','2026-08-24 10:06:39.565'),('cmt72jdvd003rtatc5zl9rwod','সিলেট','সুনামগঞ্জ',130.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.761','2026-08-24 10:06:39.569'),('cmt72jdvh003ttatcf5cly3mo','সিলেট','সিলেট',110.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:03:44.765','2026-08-24 10:06:39.574'),('cmt72n4re003vtatkiz9db061','ঢাকা','ফরিদপুর',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:06:39.578','2026-08-24 10:06:39.578'),('cmt72n4rj003xtatkm0bmgdqk','ঢাকা','গোপালগঞ্জ',100.00,'2–4 দিন',0,1,'default-settings','2026-08-24 10:06:39.583','2026-08-24 10:06:39.583');
/*!40000 ALTER TABLE `deliveryzone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homepagesection`
--

DROP TABLE IF EXISTS `homepagesection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `homepagesection` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eyebrow` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `href` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `productLimit` int NOT NULL DEFAULT '8',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `HomepageSection_categoryId_idx` (`categoryId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homepagesection`
--

LOCK TABLES `homepagesection` WRITE;
/*!40000 ALTER TABLE `homepagesection` DISABLE KEYS */;
/*!40000 ALTER TABLE `homepagesection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerPhone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shippingAddress` json NOT NULL,
  `billingAddress` json DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shippingCharge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentStatus` enum('PENDING','PAID','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `status` enum('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `freeDelivery` tinyint(1) NOT NULL DEFAULT '0',
  `deliveryDivision` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryDistrict` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_orderNumber_key` (`orderNumber`),
  KEY `Order_userId_fkey` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES ('cmta6eysv000mtajsqhsnbd8x','KB-1787753735593','cmta6c0he0000tajsdjk2f53r','Md sadim Hasan','mdsadimhasan7037@gmail.com','01608069154','{\"area\": \"asim\", \"city\": \"Mymensingh\", \"notes\": \"test\", \"address\": \"asim\"}',NULL,4600.00,0.00,0.00,4600.00,'COD','PENDING','DELIVERED','2026-08-26 14:15:35.599',0,NULL,NULL),('cmtatnimg0005taygws8fcgn8','KB-1787792765701','cmta8fejf0000ta3snv49dc88','Nadim Mahmud','mdnadim9154@gmail.com','01608069154','{\"city\": \"খুলনা\", \"notes\": \"\", \"address\": \"Mymensingh\'s\", \"district\": \"কুষ্টিয়া\"}',NULL,800.00,0.00,120.00,920.00,'MOBILE','PENDING','DELIVERED','2026-08-27 01:06:05.705',0,NULL,NULL),('cmtfl5ajk001ttags6yhbzb6x','KB-1788080809367','cmt6uigum0000tapkm0l9rodd','Sadin','mdnadim9154@gmail.com','0160806915','{\"city\": \"ময়মনসিংহ\", \"notes\": \"taratari kore diven\", \"address\": \"asim\", \"district\": \"ময়মনসিংহ\"}',NULL,6490.00,0.00,0.00,6490.00,'COD','PENDING','DELIVERED','2026-08-30 09:06:49.375',0,NULL,NULL),('cmtibgy4v0005taakn59r6ef9','KB-1788245955529','cmt6uigum0000tapkm0l9rodd','Sadin','mdnadim9154@gmail.com','0160806915','{\"city\": \"ময়মনসিংহ\", \"notes\": \"\", \"address\": \"asim\", \"district\": \"ময়মনসিংহ\"}',NULL,10568.00,0.00,0.00,10568.00,'COD','PENDING','DELIVERED','2026-09-01 06:59:15.534',0,NULL,NULL),('cmtibiq6g000jtaakm84kl103','KB-1788246038532','cmt6uigum0000tapkm0l9rodd','Sadin','mdnadim9154@gmail.com','0160806915','{\"city\": \"খুলনা\", \"notes\": \"\", \"address\": \"asim\", \"district\": \"কুষ্টিয়া\"}',NULL,900.00,0.00,120.00,1020.00,'COD','PENDING','DELIVERED','2026-09-01 07:00:38.536',0,NULL,NULL),('cmtiihaz8000rtac4ek0semhi','KB-1788257729485','cmthdkpcr0000tapczrp73466','Arafat','arafathusen7979@gmail.com','01608069154','{\"city\": \"ময়মনসিংহ\", \"notes\": \"876543efgfw23y4\", \"address\": \"asim /fulvaria\", \"district\": \"নেত্রকোনা\"}',NULL,11050.00,0.00,0.00,11050.00,'MOBILE','PENDING','PENDING','2026-09-01 10:15:29.492',0,NULL,NULL);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitem`
--

DROP TABLE IF EXISTS `orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `productName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_fkey` (`orderId`),
  KEY `OrderItem_productId_fkey` (`productId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitem`
--

LOCK TABLES `orderitem` WRITE;
/*!40000 ALTER TABLE `orderitem` DISABLE KEYS */;
INSERT INTO `orderitem` VALUES ('cmta6eysw000otajs4a4t2m8s',2,800.00,'Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 2 Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 3 Premium Handmade RGB Decorative Wall La','cmta6eysv000mtajsqhsnbd8x','cmt85k3z3000fta0wf74gednf'),('cmta6eysw000ptajsw6tmfr1f',3,1000.00,'Test','cmta6eysv000mtajsqhsnbd8x','cmta4f3gg000qtal44lf0k54b'),('cmtatnimh0007taygnq638dj4',1,800.00,'Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 2 Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 3 Premium Handmade RGB Decorative Wall La','cmtatnimg0005taygws8fcgn8','cmt85k3z3000fta0wf74gednf'),('cmtfl5ajk001vtagsaf8lqhgk',3,700.00,'প্রিমিয়াম হ্যান্ডমেড ইসলামিক আল্লাহ LED ল্যাম্প | ৭ রঙ | ৩টি লাইটিং মোড','cmtfl5ajk001ttags6yhbzb6x','cmtb5ktyp0037taygwbv2a2m3'),('cmtfl5ajk001wtagsucf8yt2x',2,120.00,'Lychee Flower Honey 8gm ATC Box 12pc','cmtfl5ajk001ttags6yhbzb6x','cmtba6bgp0015ta5s7rtsxa2h'),('cmtfl5ajk001xtagsddvu99z2',1,2650.00,'Pistachio 500g','cmtfl5ajk001ttags6yhbzb6x','cmtbauwx50028ta5ssxx9xye6'),('cmtfl5ajk001ytagsx2a07g0i',1,1500.00,'Almond 1kg','cmtfl5ajk001ttags6yhbzb6x','cmtbayfcl002bta5su8pjq3c4'),('cmtibgy4v0007taaklkyvp33v',1,800.00,'Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light','cmtibgy4v0005taakn59r6ef9','cmtazv2na002otaygekdwx0sw'),('cmtibgy4v0008taak7j1vbkyg',2,750.00,'Bamboo Design Decorative Lamp | Premium LED Home Decor Light | ঘরের সৌন্দর্যে নতুন ছোঁয়া','cmtibgy4v0005taakn59r6ef9','cmtb5daos0031taygpy55xo6u'),('cmtibgy4v0009taakuiwldp60',1,2400.00,'Sundarban Honey 1kg','cmtibgy4v0005taakn59r6ef9','cmtb9yrix0002ta5s5rmxr1qk'),('cmtibgy4v000ataakcmk9owre',1,768.00,'Sundarban Honey 15g X 24 pcs (BOX)','cmtibgy4v0005taakn59r6ef9','cmtbacau20018ta5sb6cpy514'),('cmtibgy4v000btaak7ecjhc21',1,1950.00,'Honey Combo Pack (4 types Honey)','cmtibgy4v0005taakn59r6ef9','cmtbahp54001tta5s7kai6zyo'),('cmtibgy4w000ctaakbwk4z04h',1,500.00,'Walnut 250gm','cmtibgy4v0005taakn59r6ef9','cmtbari880025ta5sta9sk05f'),('cmtibgy4w000dtaakqdtf2z6i',1,2650.00,'Pistachio 500g','cmtibgy4v0005taakn59r6ef9','cmtbauwx50028ta5ssxx9xye6'),('cmtibiq6g000ltaaknk0yykxg',1,900.00,'Premium Rose & Butterfly LED Wall Lamp | Decorative Romantic Wall Light','cmtibiq6g000jtaakm84kl103','cmtb5o9k5003ataygcdn2k1l7'),('cmtiihaz8000ttac488mktra0',2,800.00,'Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 2 Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 3 Premium Handmade RGB Decorative Wall La','cmtiihaz8000rtac4ek0semhi','cmt85k3z3000fta0wf74gednf'),('cmtiihaz8000utac4vczsl3zy',3,2650.00,'Pistachio 500g','cmtiihaz8000rtac4ek0semhi','cmtbauwx50028ta5ssxx9xye6'),('cmtiihaz8000vtac4skn098y6',1,1500.00,'Almond 1kg','cmtiihaz8000rtac4ek0semhi','cmtbayfcl002bta5su8pjq3c4');
/*!40000 ALTER TABLE `orderitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shortDescription` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regularPrice` decimal(10,2) NOT NULL,
  `salePrice` decimal(10,2) DEFAULT NULL,
  `costPrice` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `lowStock` int NOT NULL DEFAULT '5',
  `brand` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_slug_key` (`slug`),
  UNIQUE KEY `Product_sku_key` (`sku`),
  KEY `Product_categoryId_fkey` (`categoryId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES ('cmt6unmso0006ta807nn3hdyh','Premium mustard oil','premium-mustard-oil','KB-OIL-001',NULL,NULL,420.00,375.00,NULL,24,5,'Khatibazar Select',1,0,'cmt6uigvy0001tapktkgfyi6z','2026-08-24 06:23:06.024','2026-08-24 12:18:48.614'),('cmt6unmt90008ta800dwk0nny','Terracotta tea cups','terracotta-tea-cups','KB-HOME-001',NULL,NULL,680.00,0.00,NULL,12,5,'Karukaj',1,0,'cmt6uigw60002tapk1qv6s60j','2026-08-24 06:23:06.045','2026-08-25 04:19:33.916'),('cmt6unmte000ata80nbct21sq','Cotton hand towels','cotton-hand-towels','KB-HOME-002',NULL,NULL,390.00,320.00,NULL,35,5,'Nokshi',1,0,'cmt6uigw60002tapk1qv6s60j','2026-08-24 06:23:06.051','2026-08-24 09:47:37.333'),('cmt6unmtl000cta803hrlumzt','Organic date molasses','date-molasses','KB-PAN-002',NULL,NULL,550.00,0.00,NULL,18,5,'Nokshi',1,0,'cmt6uigvy0001tapktkgfyi6z','2026-08-24 06:23:06.057','2026-08-24 09:47:45.292'),('cmt6w66mr0001tavwoak2sni0','lamp light','lamp-light','10','','',800.00,700.00,NULL,20,5,'pono mela',0,0,'cmt6uigw60002tapk1qv6s60j','2026-08-24 07:05:31.142','2026-08-24 07:05:37.641'),('cmt70peb2001dtaigkdvtecvt','fan this is a fan','fan','12','test product','this ia porudct',2000.00,1500.00,NULL,20,4,'ponno mela',1,0,'cmt6uigw60002tapk1qv6s60j','2026-08-24 09:12:26.027','2026-08-25 04:19:26.785'),('cmt85k3z3000fta0wf74gednf','Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 2 Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 3 Premium Handmade RGB Decorative Wall La','premium-handmade-rgb-decorative-wall-lamp','11','Premium Handmade Decorative Wall Lamp with beautiful Palm Tree, Flower & Village Scenery Design। ৭টি RGB Color ও ৩টি Lighting Mode-এর মাধ্যমে আপনার ঘরে তৈরি করুন সুন্দর, cozy ও premium lighti','আপনার Bedroom, Living Room, Drawing Room, Staircase কিংবা Hallway সাজাতে নিয়ে আসুন Premium Handmade Decorative Wall Lamp।\n\nসুন্দর Palm Tree, Flower & Village Scenery Design, soft LED light এ',1000.00,800.00,NULL,4,5,'PONNO MELA',0,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-25 04:16:03.616','2026-09-01 10:15:29.505'),('cmta4f3gg000qtal44lf0k54b','Test','test','24','test','test',2000.00,1000.00,NULL,37,6,'Ponno mela',1,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-26 13:19:42.399','2026-08-26 14:15:35.653'),('cmtaetgdi001btae0vcb9dknl','Premium Love Hand LED Wall Lamp | Romantic Decorative Light | ভালোবাসার উপহার','pemium-love-lamp','20','এই Premium Love Hand LED Wall Lamp-এ রয়েছে সুন্দর হাত-ধরা কাপল ডিজাইন, রোমান্টিক বাংলা লেখা এবং warm golden LED glow। Bedroom, Living Room, Couple Corner কিংবা Anniversary Gift হিসেবে এটি দার','❤️ ভালোবাসার গল্প এবার ফুটে উঠুক আলোর মাঝে\nআপনার প্রিয় মানুষটির জন্য এমন একটি উপহার দিন, যা শুধু ঘর সাজাবে না—প্রতিদিন আপনাদের ভালোবাসার সুন্দর মুহূর্তগুলো মনে করিয়ে দেবে।\n\nPremium Love Hand ',1000.00,800.00,NULL,1000,8,'ponno mela',1,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-26 18:10:48.486','2026-08-27 09:11:25.392'),('cmtazv2na002otaygekdwx0sw','Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light','Premium-handmade','99','আপনার Bedroom, Living Room, Drawing Room, Staircase কিংবা Hallway সাজাতে নিয়ে আসুন Premium Handmade Decorative Wall Lamp।\n\nসুন্দর Palm Tree, Flower & Village Scenery Design, soft LED light এ','আপনার Bedroom, Living Room, Drawing Room, Staircase কিংবা Hallway সাজাতে নিয়ে আসুন Premium Handmade Decorative Wall Lamp।\n\nসুন্দর Palm Tree, Flower & Village Scenery Design, soft LED light এ',1000.00,800.00,NULL,19,6,'PONNO MELA',0,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-27 03:59:55.942','2026-09-01 06:59:15.558'),('cmtb5daos0031taygpy55xo6u','Bamboo Design Decorative Lamp | Premium LED Home Decor Light | ঘরের সৌন্দর্যে নতুন ছোঁয়া','bamboo-design','30','✨ আপনার ঘরে আনুন আধুনিক নান্দনিকতা ও প্রিমিয়াম আলোকসজ্জার ছোঁয়া!\n\nএই Premium Handmade Bamboo Design LED Lamp সম্পূর্ণ হাতে তৈরি একটি প্রিমিয়াম ডেকোরেটিভ ল্যাম্প। এতে রয়েছে ৭টি RGB রঙ এবং ','আপনার ঘরে এনে দিন আধুনিক সৌন্দর্য, নান্দনিক আলোকসজ্জা এবং প্রিমিয়াম ডেকোরেশনের এক অনন্য সমন্বয়।\n\nএই Premium Handmade Bamboo Design LED Lamp সম্পূর্ণ হাতে তৈরি (Handcrafted) একটি প্রিমিয়াম ',950.00,750.00,NULL,18,5,'PONNO MELA',1,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-27 06:34:04.242','2026-09-01 06:59:15.569'),('cmtb5ktyp0037taygwbv2a2m3','প্রিমিয়াম হ্যান্ডমেড ইসলামিক আল্লাহ LED ল্যাম্প | ৭ রঙ | ৩টি লাইটিং মোড','premium-allah-caligraphy','19','✨ আপনার ঘরে আনুন আধ্যাত্মিক প্রশান্তি ও নান্দনিক সৌন্দর্য!\n\nএই Premium Handmade Allah LED Lamp সম্পূর্ণ হাতে তৈরি একটি প্রিমিয়াম ইসলামিক ডেকোরেশন ল্যাম্প। এতে রয়েছে ৭টি RGB রঙ এবং ৩টি লাইটি','আপনার ঘরে এনে দিন আধ্যাত্মিক প্রশান্তি, নান্দনিক সৌন্দর্য এবং আধুনিক আলোকসজ্জার এক অনন্য সমন্বয়।\n\nএই Premium Handmade Islamic Allah LED Lamp সম্পূর্ণ হাতে তৈরি (Handcrafted) একটি প্রিমিয়াম ',900.00,700.00,NULL,97,7,'PONNO MELA',0,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-27 06:39:55.824','2026-08-30 09:06:49.398'),('cmtb5o9k5003ataygcdn2k1l7','Premium Rose & Butterfly LED Wall Lamp | Decorative Romantic Wall Light','premium-rose','15','আপনার ঘরের সৌন্দর্য ও ভালোবাসার মুহূর্তকে আরও বিশেষ করে তুলুন Premium Rose & Butterfly LED Wall Lamp দিয়ে। আকর্ষণীয় Rose & Butterfly cut-out design, soft LED glow এবং elegant black finish—B','🌹 ভালোবাসার মানুষকে দিন একটি সুন্দর আলোভরা উপহার\nঘরের সাধারণ দেয়ালকে করে তুলুন আরও আকর্ষণীয়, elegant এবং romantic।\nPremium Rose & Butterfly LED Wall Lamp-এর সুন্দর Rose ও Butterfly design এবং',1100.00,900.00,NULL,9,5,'PONNO MELA',0,1,'cmt84gl5o0000ta0w1vpsk9a4','2026-08-27 06:42:36.004','2026-09-01 07:00:38.549'),('cmtb5y4k6003htayg11miuzcl','Honey Nuts 800gm','honey-nuts','13','However, discussions around “honey nuts” likely became popular after the COVID-19 pandemic. With the rapid rise of online-based businesses during that time, the name “honey nuts” reached peop','The relationship between nuts and honey may seem new, but their history goes back a long way. According to researchers, along with fruits, vegetables, and meat, nuts have long been in demand ',2000.00,1700.00,NULL,20,5,'PONNO MELS',1,1,'cmtb5tu4t003ctaygwfge58hl','2026-08-27 06:50:16.085','2026-08-27 06:50:16.085'),('cmtb6c9s8003ztayg4c58d31x','Honey Nuts 500gm','premium-honey-nuts','14','However, discussions around “honey nuts” likely became popular after the COVID-19 pandemic. With the rapid rise of online-based businesses during that time, the name “honey nuts” reached peop','The relationship between nuts and honey may seem new, but their history goes back a long way. According to researchers, along with fruits, vegetables, and meat, nuts have long been in demand ',1300.00,1100.00,NULL,6,5,'PONO MELA',0,1,'cmtb5tu4t003ctaygwfge58hl','2026-08-27 07:01:16.040','2026-08-27 07:01:16.040'),('cmtb9yrix0002ta5s5rmxr1qk','Sundarban Honey 1kg','sundarban-oney ','22','খাঁটি সুন্দরবনের প্রাকৃতিক মধু। সুস্বাদু, ঘন ও প্রাকৃতিক গুণে ভরপুর। প্রতিদিনের স্বাস্থ্যকর খাদ্য তালিকায় যোগ করুন প্রকৃতির বিশুদ্ধ মিষ্টতা।','সুন্দরবনের প্রাকৃতিক পরিবেশ থেকে সংগ্রহ করা খাঁটি ও সুস্বাদু মধু। এই মধুতে রয়েছে প্রাকৃতিক স্বাদ, সুন্দর ঘ্রাণ এবং ঘন টেক্সচার, যা আপনার প্রতিদিনের খাবারে যোগ করবে ভিন্ন মাত্রা।\n\nচা, দুধ, রুট',2500.00,2400.00,NULL,65,6,'PONNO MELA',1,1,'cmtb9qyl30000ta5stsyzg37c','2026-08-27 08:42:44.312','2026-09-01 06:59:15.572'),('cmtba6bgp0015ta5s7rtsxa2h','Lychee Flower Honey 8gm ATC Box 12pc','Lychee-flower-honey','21','লিচু ফুলের মধু দিয়ে তৈরি সুস্বাদু ও প্রাকৃতিক স্বাদের Lychee Flower Honey। প্রতিটি প্যাকেটে ৮টি স্যাশে, প্রতি স্যাশে ১২ গ্রাম—মোট ৯৬ গ্রাম।','লিচু ফুলের মৌসুমের বিশেষ স্বাদ ও ঘ্রাণে তৈরি Lychee Flower Honey আপনার প্রতিদিনের খাবারের জন্য একটি সুস্বাদু পছন্দ। ছোট ছোট স্যাশে প্যাকেট হওয়ায় এটি বহন ও ব্যবহার করা সহজ।\n\nচা, রুটি, ফল, নাস্',150.00,120.00,NULL,78,5,'Ponno mela',1,1,'cmtb9qyl30000ta5stsyzg37c','2026-08-27 08:48:36.745','2026-08-30 09:06:49.404'),('cmtbacau20018ta5sb6cpy514','Sundarban Honey 15g X 24 pcs (BOX)','sundarban-honey','23','সুন্দরবনের প্রাকৃতিক পরিবেশ থেকে সংগৃহীত সুস্বাদু মধু। প্রতিটি বক্সে রয়েছে ১৫ গ্রাম করে ২৪টি স্যাশে—মোট ৩৬০ গ্রাম।','প্রকৃতির অপার সৌন্দর্যে ঘেরা সুন্দরবন অঞ্চল থেকে সংগৃহীত মধুর স্বাদ নিয়ে তৈরি Sundarban’s Honey। সুবিধাজনক স্যাশে প্যাকেট হওয়ায় প্রতিদিনের ব্যবহারে এটি সহজ, পরিচ্ছন্ন ও বহনযোগ্য।\n\nচা, রুটি, ন',770.00,768.00,NULL,76,5,'Khatibazar',1,1,'cmtb9qyl30000ta5stsyzg37c','2026-08-27 08:53:15.865','2026-09-01 06:59:15.575'),('cmtbahp54001tta5s7kai6zyo','Honey Combo Pack (4 types Honey)','honey-combo-pack','17','খাঁটি স্বাদ ও প্রাকৃতিক মিষ্টতায় ভরপুর উন্নতমানের মধু। চা, দুধ, শরবত, রুটি বা সরাসরি খাওয়ার জন্য উপযোগী। দৈনন্দিন খাবারে প্রাকৃতিক মিষ্টির সুন্দর একটি বিকল্প।','🍯 প্রাকৃতিক স্বাদের মধু\n\nপ্রকৃতির মিষ্টি উপহার মধু—যার স্বাদ, ঘ্রাণ ও ঘনত্ব যেকোনো সময়ের খাবারকে আরও উপভোগ্য করে তুলতে পারে। যারা দৈনন্দিন খাবারে প্রাকৃতিক মিষ্টির স্বাদ পছন্দ করেন, তাদের জন্',1980.00,1950.00,NULL,51,5,'Khatibazar',0,1,'cmtb9qyl30000ta5stsyzg37c','2026-08-27 08:57:27.688','2026-09-01 06:59:15.578'),('cmtbalv6z001wta5sirl590o3','African Organic Wild Honey 500g','African-Organic ','16','খাঁটি স্বাদ ও প্রাকৃতিক মিষ্টতায় ভরপুর উন্নতমানের মধু। চা, দুধ, শরবত, রুটি বা সরাসরি খাওয়ার জন্য উপযোগী। দৈনন্দিন খাবারে প্রাকৃতিক মিষ্টির সুন্দর একটি বিকল্প।','🍯 প্রাকৃতিক স্বাদের মধু\n\nপ্রকৃতির মিষ্টি উপহার মধু—যার স্বাদ, ঘ্রাণ ও ঘনত্ব যেকোনো সময়ের খাবারকে আরও উপভোগ্য করে তুলতে পারে। যারা দৈনন্দিন খাবারে প্রাকৃতিক মিষ্টির স্বাদ পছন্দ করেন, তাদের জন্',1350.00,1250.00,NULL,44,8,'KHATIBAZAR',1,1,'cmtb9qyl30000ta5stsyzg37c','2026-08-27 09:00:42.154','2026-08-27 09:00:42.154'),('cmtbari880025ta5sta9sk05f','Walnut 250gm','Walnut','25','Walnuts are well-known for their numerous health benefits. These nuts are not only delicious but also packed with nutrients that support overall wellness. Here are some of the major benefits:','Walnut, commonly known as Akhrot, is a highly popular tree nut valued for its rich nutritional profile and unique flavor. The scientific name of the walnut tree is Juglans regia. Although it ',600.00,500.00,NULL,76,5,'kHATIBAZAR',1,1,'cmtb5tu4t003ctaygwfge58hl','2026-08-27 09:05:05.288','2026-09-01 06:59:15.581'),('cmtbauwx50028ta5ssxx9xye6','Pistachio 500g','Pistachio','26','Net Weight: 500g\nType: Whole Pistachios\nStorage Instructions: Store in a cool, dry place in an airtight container. Refrigerate after opening to help retain freshness and crunch for longer.','\n\nEnjoy the rich, buttery flavor and satisfying crunch of premium Pistachios, a wholesome and nutrient-dense snack for the whole family. Naturally rich in protein, healthy fats, and fiber, th',2700.00,2650.00,NULL,72,7,'khatibazar',1,1,'cmtb5tu4t003ctaygwfge58hl','2026-08-27 09:07:44.297','2026-09-01 10:15:29.509'),('cmtbayfcl002bta5su8pjq3c4','Almond 1kg','Almond ','27','The monounsaturated fats in almonds help lower bad cholesterol levels, reducing the risk of heart disease.\n','Almonds, one of the world’s most popular and nutritious nuts, are rich in vitamins, minerals, and antioxidants that offer numerous health benefits. Their naturally sweet taste and impressive ',1600.00,1500.00,NULL,74,5,'KHATIBAZAR',1,1,'cmtb5tu4t003ctaygwfge58hl','2026-08-27 09:10:28.149','2026-09-01 10:15:29.511');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productimage`
--

DROP TABLE IF EXISTS `productimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productimage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ProductImage_productId_fkey` (`productId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimage`
--

LOCK TABLES `productimage` WRITE;
/*!40000 ALTER TABLE `productimage` DISABLE KEYS */;
INSERT INTO `productimage` VALUES ('cmt85o1bk000lta0wfdtlb3fj','/uploads/375be4b4-258e-4d7a-8e1f-be5999566b48.png','',0,'cmt70peb2001dtaigkdvtecvt'),('cmt71xxl7001jtaiggus5so0t','/uploads/f11fd51b-ca0f-42f4-a1d4-96452fdf49e4.webp','Organic date molasses',0,'cmt6unmtl000cta803hrlumzt'),('cmt77djep0000ta10kgbiqx4z','/uploads/c855c855-7dd8-4cab-908e-efd1c96a7846.webp','Terracotta tea cups',0,'cmt6unmt90008ta800dwk0nny'),('cmt85k3zb000gta0wpb9jsbyt','/uploads/bde6f138-8a98-470a-b95c-104edc0cd296.webp','Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 2 Premium Handmade RGB Decorative Wall Lamp | Modern LED Wall Light - Image 3 Premium Handmade RGB Decorative Wall La',0,'cmt85k3z3000fta0wf74gednf'),('cmta4f3gi000rtal49gng4qpe','/uploads/d7b2b931-90fe-4612-9348-19a301302fde.png',NULL,0,'cmta4f3gg000qtal44lf0k54b'),('cmtbaznip002dta5s2ho7exk1','/uploads/d008491e-25d8-4909-99d0-3fbdfa5cebaf.webp',NULL,0,'cmtaetgdi001btae0vcb9dknl'),('cmtazv2na002ptaygjnzcy99b','/uploads/25733d9c-2a4d-42b0-b3bf-b06cf1e23e9f.webp',NULL,0,'cmtazv2na002otaygekdwx0sw'),('cmtb5daot0032tayg9cbnwee3','/uploads/9bead586-3117-465f-94f5-a759a12640b2.png',NULL,0,'cmtb5daos0031taygpy55xo6u'),('cmtb5ktyp0038tayg4bv1hp27','/uploads/ab2f91b2-9576-428c-a052-5ddba17bad91.png',NULL,0,'cmtb5ktyp0037taygwbv2a2m3'),('cmtb5o9k5003btayg5z0kekqq','/uploads/a44f926a-2268-4234-825c-7fd570c7bdce.webp',NULL,0,'cmtb5o9k5003ataygcdn2k1l7'),('cmtb5y4k6003itaygzwj0dvrs','/uploads/58d51f37-76d3-4ef2-937e-4d779a27ec89.jpg',NULL,0,'cmtb5y4k6003htayg11miuzcl'),('cmtb6c9s80040taygk09s4tn3','/uploads/b2ccc304-8c8d-43db-9782-4e5bd60621fe.jpg',NULL,0,'cmtb6c9s8003ztayg4c58d31x'),('cmtb9yrix0003ta5sqagztwdi','/uploads/7a0e630c-65c0-4419-b930-74358865a140.jpg',NULL,0,'cmtb9yrix0002ta5s5rmxr1qk'),('cmtba6bgp0016ta5s1fa1laya','/uploads/334ff481-84e0-4e97-b7c1-3865ea139798.jpg',NULL,0,'cmtba6bgp0015ta5s7rtsxa2h'),('cmtbacau20019ta5s35w19znn','/uploads/989be5a0-c3c4-41a8-93df-ce15970856c1.png',NULL,0,'cmtbacau20018ta5sb6cpy514'),('cmtbahp54001uta5sus51i6hb','/uploads/0f287e74-c919-4fca-8221-08e630fbc00b.jpg',NULL,0,'cmtbahp54001tta5s7kai6zyo'),('cmtbalv6z001xta5s4xubl5nu','/uploads/338c4987-0216-460d-84f2-99f7a71c35c7.jpg',NULL,0,'cmtbalv6z001wta5sirl590o3'),('cmtbari880026ta5sbel7niz9','/uploads/e786713c-6840-4ab3-a578-2d7f8d5a48e1.jpg',NULL,0,'cmtbari880025ta5sta9sk05f'),('cmtbauwx50029ta5slp8ypura','/uploads/3af5fc3c-2846-4b04-b006-c7369dda20b8.jpg',NULL,0,'cmtbauwx50028ta5ssxx9xye6'),('cmtcdvnjh0008tauw19scmzf0','/uploads/d84c7182-6deb-4ec6-abd2-4ca818809e94.jpg',NULL,0,'cmtbayfcl002bta5su8pjq3c4');
/*!40000 ALTER TABLE `productimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productvariant`
--

DROP TABLE IF EXISTS `productvariant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productvariant` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductVariant_sku_key` (`sku`),
  KEY `ProductVariant_productId_fkey` (`productId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productvariant`
--

LOCK TABLES `productvariant` WRITE;
/*!40000 ALTER TABLE `productvariant` DISABLE KEYS */;
/*!40000 ALTER TABLE `productvariant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `verifiedPurchase` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `Review_userId_fkey` (`userId`),
  KEY `Review_productId_fkey` (`productId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
INSERT INTO `review` VALUES ('cmtfvzdrx000dtal4c9je130b',5,'nice',1,'cmt6uigum0000tapkm0l9rodd','cmt85k3z3000fta0wf74gednf','2026-08-30 14:10:09.405',0),('cmth78ayo001gtakksavl75b9',4,'onek sundor',1,'cmt6uigum0000tapkm0l9rodd','cmtbacau20018ta5sb6cpy514','2026-08-31 12:12:47.615',0),('cmth9osrb0000taigcxws2ab2',4,'good product',1,'cmt6uigum0000tapkm0l9rodd','cmtaetgdi001btae0vcb9dknl','2026-08-31 13:21:36.404',0),('cmthdzs6u000btapczccvyxii',5,'very beautiful lamp',1,'cmthdkpcr0000tapczrp73466','cmt85k3z3000fta0wf74gednf','2026-08-31 15:22:07.351',0);
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sitesettings`
--

DROP TABLE IF EXISTS `sitesettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sitesettings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siteName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Khatibazar',
  `logo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BDT',
  `shippingCharge` decimal(10,2) NOT NULL DEFAULT '60.00',
  `freeDeliveryThreshold` decimal(10,2) NOT NULL DEFAULT '2000.00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sitesettings`
--

LOCK TABLES `sitesettings` WRITE;
/*!40000 ALTER TABLE `sitesettings` DISABLE KEYS */;
INSERT INTO `sitesettings` VALUES ('default-settings','Khatibazar',NULL,'hello@khatibazar.com',NULL,'BDT',60.00,2000.00);
/*!40000 ALTER TABLE `sitesettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('USER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('cmt6uigum0000tapkm0l9rodd','Khatibazar Admin','admin@example.com',NULL,'$2b$12$GadIGJbEcHibmKOZhBBGouyYF3JN.Ryal4jFSwixYE4dNL6F91br6','ADMIN','/uploads/users/cmt6uigum0000tapkm0l9rodd-1788240989929.png',NULL,'2026-08-24 06:19:05.034','2026-09-01 06:23:30.582'),('cmta6c0he0000tajsdjk2f53r','Md sadim Hasan','mdsadimhasan7037@gmail.com','01499999994','$2b$12$VP0UJEgOYxs1PJ1sFYDxAeVQcgASabu5mkACVYm3KB9rNrK5piGEK','USER',NULL,NULL,'2026-08-26 14:13:17.809','2026-08-26 14:13:17.809'),('cmta8fejf0000ta3snv49dc88','nadim','mdnadim9154@gmail.com','01608069154','$2b$12$L46DyOLvoTxEAQhCsx02UeTGC0M4r2nfnkxpIzRGM/vNmuvF1/I5q','USER',NULL,NULL,'2026-08-26 15:11:55.222','2026-08-26 15:11:55.222'),('cmta9tkv30000tad8w5fxl4jj','Nadim','mdanas3333@gmail.com','0160807575','$2b$12$Ql4.U0SoRPV.Z0j/6cC3bOTy/WYXxT/T8CUimeCT44Oxu6E4zkxde','USER',NULL,NULL,'2026-08-26 15:50:56.223','2026-08-26 15:50:56.223'),('cmthdkpcr0000tapczrp73466','Arafat','arafathusen7979@gmail.com','0166666666','$2b$12$GRl0PXQAStfGOg/4eLUgIO.ZSjLmWbXQMEulE4f9y39xtGt2W8f8C','USER','/uploads/users/cmthdkpcr0000tapczrp73466-1788256738048-f5971c924f9daa9417f85624.jpg',NULL,'2026-08-31 15:10:23.828','2026-09-01 09:59:06.386');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Wishlist_userId_key` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
INSERT INTO `wishlist` VALUES ('cmta0bbp30001tal4z08hn5pw','cmt6uigum0000tapkm0l9rodd'),('cmta6hnxa000rtajs0gto9e8h','cmta6c0he0000tajsdjk2f53r'),('cmtb4pjcx002rtayg1ajgf4x5','cmta8fejf0000ta3snv49dc88'),('cmthdkwtb0002tapcqlsqrj3p','cmthdkpcr0000tapczrp73466');
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlistitem`
--

DROP TABLE IF EXISTS `wishlistitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlistitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wishlistId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `WishlistItem_wishlistId_productId_key` (`wishlistId`(64),`productId`(64)),
  KEY `WishlistItem_wishlistId_fkey` (`wishlistId`),
  KEY `WishlistItem_productId_fkey` (`productId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlistitem`
--

LOCK TABLES `wishlistitem` WRITE;
/*!40000 ALTER TABLE `wishlistitem` DISABLE KEYS */;
INSERT INTO `wishlistitem` VALUES ('cmthdkwu70004tapcr6xamb22','cmthdkwtb0002tapcqlsqrj3p','cmtbayfcl002bta5su8pjq3c4'),('cmta6hnyr000ttajscdpggu45','cmta6hnxa000rtajs0gto9e8h','cmta4f3gg000qtal44lf0k54b'),('cmta6hp7d000xtajso7j4rxaa','cmta6hnxa000rtajs0gto9e8h','cmt85k3z3000fta0wf74gednf'),('cmtb4pkw7002ztayg4q1xkdjs','cmtb4pjcx002rtayg1ajgf4x5','cmtazv2na002otaygekdwx0sw'),('cmtb6hbwq004ctaygt2jqfjh6','cmtb4pjcx002rtayg1ajgf4x5','cmta4f3gg000qtal44lf0k54b'),('cmtb6hdds004gtaygf7nkz1u3','cmtb4pjcx002rtayg1ajgf4x5','cmtaetgdi001btae0vcb9dknl'),('cmth2ejtz0015takk9mfbbeyd','cmta0bbp30001tal4z08hn5pw','cmtbalv6z001wta5sirl590o3'),('cmthbqoab0005taag1l3p0m3o','cmta0bbp30001tal4z08hn5pw','cmtbari880025ta5sta9sk05f'),('cmtgqxpd20003tavweqjrdhag','cmta0bbp30001tal4z08hn5pw','cmtb5y4k6003htayg11miuzcl'),('cmtibl3ym000ptaakug5o4uq9','cmta0bbp30001tal4z08hn5pw','cmtba6bgp0015ta5s7rtsxa2h'),('cmtibl606000ttaak4ga9e2x5','cmta0bbp30001tal4z08hn5pw','cmtb9yrix0002ta5s5rmxr1qk'),('cmth2k18d001btakkvr4b0bmx','cmta0bbp30001tal4z08hn5pw','cmtbacau20018ta5sb6cpy514');
/*!40000 ALTER TABLE `wishlistitem` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 17:52:47
