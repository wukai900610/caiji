var https = require('https');
var http = require('http');
var mysql = require('mysql');

var util = {
    connection:function() {
        return mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test'
        });
    },
    creditProductTable:function (connection,tableName) {
        var sql;
        // sql = 'CREATE DATABASE [IF NOT EXISTS] test;DEFAULT CHARACTER SET utf8mb4_unicode_ci;DEFAULT COLLATE utf8mb4_unicode_ci;'
        // connection.query(sql);

        sql = 'CREATE TABLE IF NOT EXISTS `'+tableName+'` (`id` int(10) NOT NULL,`title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,`supply` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`priceRange` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`minOrder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`payments` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`num` int(5) NOT NULL,`imgs` longtext COLLATE utf8mb4_unicode_ci,`videoSrc` text COLLATE utf8mb4_unicode_ci,`videoImg` text COLLATE utf8mb4_unicode_ci,`overview` text COLLATE utf8mb4_unicode_ci,`richText` longtext COLLATE utf8mb4_unicode_ci) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
        connection.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
        });
        // sql = 'ALTER TABLE `'+tableName+'` ADD UNIQUE KEY `id` (`id`);'
        // connection.query(sql);
        // sql = 'ALTER TABLE `'+tableName+'` MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;'
        // connection.query(sql);
    },
    creditSupplyTable:function(connection,tableName) {
        var sql;
        // sql = 'NO_AUTO_VALUE_ON_ZERO;'
        // connection.query(sql);
        // sql = 'SET time_zone = "+00:00";'
        // connection.query(sql);

        sql = 'CREATE TABLE IF NOT EXISTS `'+tableName+'` (`id` int(10) NOT NULL,`companyName` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,`fullCategory` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,`baseInfo` text COLLATE utf8mb4_unicode_ci,`imgs` text COLLATE utf8mb4_unicode_ci,`otherContent` text COLLATE utf8mb4_unicode_ci,`productsUrl` text COLLATE utf8mb4_unicode_ci,`connectInfo` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
        connection.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                console.log('sql err,继续');
                return;
            }
        });
        sql = 'ALTER TABLE `'+tableName+'` ADD UNIQUE KEY `id` (`id`);'
        connection.query(sql, function(err, result) {
            if (err) {
                console.log('sql err,继续');
            }
        });
        sql = 'ALTER TABLE `'+tableName+'` MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;'
        connection.query(sql, function(err, result) {
            if (err) {
                console.log('sql err,继续');
            }
        });
    },
    insertData:function (connection,tableName,data) {
        var paramsName ='';
        var values ='';
        var addSqlParams = [];
        // console.log('-----------');
        // console.log(data);
        // return false
        for (var i in data){
            // console.log(i);
            paramsName = paramsName +',' + i
            values = values + ',?'

            addSqlParams.push(data[i])
        }
        // return false;
        var addSql = 'INSERT INTO '+tableName+'(id' + paramsName + ') VALUES(0' + values + ')'
        // console.log(addSql);
        // console.log(addSqlParams);
        // return false;
        //增
        connection.query(addSql, addSqlParams, function(err, result) {
            if (err) {
                console.log('----------------');
                console.log(addSql);
                console.log(addSqlParams);
                console.log('[INSERT ERROR] - ', err.message);
                console.log('----------------');
                return;
            }
        });
    },
    myHttps:function (url, config) {
        let options = Object.assign({
            method: 'get',
            headers:{
                "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
                'Content-Type':'application/x-www-form-urlencoded'
            }
        }, config);

        let promise = new Promise(function(resolve, rejecte) {
            let req = https.request(url, options, (res) => {
                res.setEncoding('utf8');
                let finalData = '';
                res.on('data', (d) => {
                    // console.error(d);
                    finalData += d;
                });
                res.on('end', (d) => {
                    resolve(finalData.toString())
                });
            }).on('error', (e) => {
                // console.error(e);
            });
            req.end();
        })
        return promise;
    },
    myHttp:function (url, config) {
        let options = Object.assign({
            method: 'get'
        }, config);

        let promise = new Promise(function(resolve, rejecte) {
            let req = http.request(url, options, (res) => {
                res.setEncoding('utf8');
                let finalData = '';
                res.on('data', (d) => {
                    finalData += d;
                });
                res.on('end', (d) => {
                    resolve(finalData.toString())
                });
            }).on('error', (e) => {
                console.error(e);
            });
            req.end();
        })
        return promise;
    },
    eventEmitter: {
        emit: function (eventName) {
            var callbackArr = util.events[eventName]
            if (callbackArr && callbackArr.length) {
                for (var i = 0; i < callbackArr.length; i++) {
                    callbackArr[i]()
                }
            }
        }
    },
    events: {},
    eventListener: {
        on: function (eventName, callback) {
            if (!util.events[eventName]) {
                util.events[eventName] = []
            }
            util.events[eventName].push(callback)
        },
        remove: function (eventName, callback) {
            var callbackArr = util.events[eventName]
            if (callbackArr && callbackArr.length) {
                var index = callbackArr.indexOf(callback);
                callbackArr.splice(index, 1);
            }
        }
    }
}

module.exports = util;
