var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var https = require('https');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

var page = 100;
var detailNum;
let listData;
var tableName = '1688_supplys';
let pageUrl = 'https://www.alibaba.com/catalog/animal-products_cid100003006?page='+page;

function creditTable() {
    var sql;
    // var sql = 'NO_AUTO_VALUE_ON_ZERO;'
    // connection.query(sql);
    // sql = 'SET time_zone = "+00:00";'
    // connection.query(sql);

    sql = 'CREATE TABLE IF NOT EXISTS `'+tableName+'` (`id` int(10) NOT NULL,`title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,`supply` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`priceRange` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`minOrder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`payments` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,`num` int(5) NOT NULL,`imgs` longtext COLLATE utf8mb4_unicode_ci,`videoSrc` text COLLATE utf8mb4_unicode_ci,`videoImg` text COLLATE utf8mb4_unicode_ci,`overview` text COLLATE utf8mb4_unicode_ci,`richText` longtext COLLATE utf8mb4_unicode_ci) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
    connection.query(sql, function(err, result) {
        if (err) {
            console.log(err);
            return;
        }
    });
    sql = 'ALTER TABLE `'+tableName+'` ADD UNIQUE KEY `id` (`id`);'
    connection.query(sql);
    sql = 'ALTER TABLE `'+tableName+'` MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;'
    connection.query(sql);
}

creditTable();

return false;

function myHttps(url, config) {
    let options = Object.assign({
        method: 'get',
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
}

function insertData(data) {
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
}

async function getDetail(detailItem) {
    console.log(detailItem.url);
    let result = await myHttps(detailItem.url);
    let $ = cheerio.load(result);

    let imgs = [];
    let videoSrc = $('#video-preload').attr('src');
    let videoImg = '';
    $('.widget-detail-booth-image .inav li').each(function (index) {
        if($(this).hasClass('play')){
            videoImg = $(this).find('img').attr('src');
        }else{
            let src = $(this).find('img').attr('src').replace('.png_50x50','').replace('.jpg_50x50','').replace('.gif_50x50','');
            imgs.push(src);
        }
    });

    let title = $('.ma-title').text();
    let priceRange = $('.ma-ref-price').text();
    let minOrder = $('.ma-min-order').text();
    let payments = $('.assurance-payment .payment-val').text();

    var overview = {};
    $('.do-entry-list dl.do-entry-item').each(function () {
        let key = $(this).find('dt').text().replace(':','').trim();
        let value = '';
        if(key === 'Lead Time'){
            value = $(this).find('.do-entry-item-val').html();
            // .replace(/[\n\r]/g,'<br>').trim()
        }else{
            value = $(this).find('.do-entry-item-val').text().trim();
        }

        overview[key] = value;
    });
    let richText = $('#J-rich-text-description').html();

    var insert_data = {
        title:title,
        supply:detailItem.companyName,
        imgs:imgs.toString(),
        videoSrc:videoSrc||'',
        videoImg:videoImg||'',
        priceRange:priceRange,
        minOrder:minOrder,
        payments:payments,
        overview:JSON.stringify(overview),
        richText:richText,
        num:detailNum
    };
    // console.log(title);
    // console.log();
    if(title){
        insertData(insert_data);
    }
    detailNum++;

    let nextUrl = listData[detailNum];
    if(nextUrl){
        setTimeout(function () {
            getDetail(nextUrl)
        }, 300);
    }else{
        setTimeout(function () {
            nightmareList();
        }, 2000);
    }
}

function nightmareList() {
    if(page > 100) {
        console.log('end');
        return;
    };

    // 初始化详情数编号
    listData = [];
    detailNum = 0;


    const nightmare = Nightmare({
    	// show: true
    });

    nightmare
	.goto(pageUrl)
    // .wait(300)
    .scrollTo(5000,0)
    // .wait(300)
    .scrollTo(10000,0)
    .inject('js', './jquery.js')
	.evaluate(() => {
        var data = [];
        $('.organic-list .J-offer-wrapper').each(function () {
            var name = $(this).find('.organic-gallery-title__content').text();
            var url = $(this).find('.organic-gallery-title').attr('href');
            var companyName = $(this).find('.organic-gallery-offer__seller-company').text();
            data.push({
                name:name,
                url:'https:'+url,
                companyName:companyName,
            });
        });

        return data;
    })
	// .end()
	.then((data)=>{
        listData = data;
        console.log('-----------start------------');
        // console.log(listData);
        console.log(listData.length);
        console.log(page);
        console.log('');
        page++;
        getDetail(listData[detailNum]);

        // if(page<100){
        //     page++;
        //     setTimeout(function () {
        //         nightmareList();
        //     }, 30000);
        // }
    })
	.catch(error => {
		console.error('Search failed:', error)
	})
}

nightmareList();
