-- phpMyAdmin SQL Dump
-- version 4.4.10
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2020-07-15 03:16:11
-- 服务器版本： 5.7.17
-- PHP Version: 7.3.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- 表的结构 `1688_product_agriculturalWaste`
--

CREATE TABLE IF NOT EXISTS `1688_product_agriculturalWaste` (
  `id` int(10) NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priceRange` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `minOrder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payments` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `num` int(5) NOT NULL,
  `imgs` longtext COLLATE utf8mb4_unicode_ci,
  `videoSrc` text COLLATE utf8mb4_unicode_ci,
  `videoImg` text COLLATE utf8mb4_unicode_ci,
  `overview` text COLLATE utf8mb4_unicode_ci,
  `richText` longtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `1688_product_agriculturalWaste`
--
ALTER TABLE `1688_product_agriculturalWaste`
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `1688_product_agriculturalWaste`
--
ALTER TABLE `1688_product_agriculturalWaste`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
