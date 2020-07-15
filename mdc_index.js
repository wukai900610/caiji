// var http = require('http');
var cheerio = require('cheerio');
var https = require('https');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

connection.connect();

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
    var addSql = 'INSERT INTO mdc_product_Onion(id' + paramsName + ') VALUES(0' + values + ')'
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

// let firstUrl = 'https://www.made-in-china.com/Agriculture-Food-Catalog/Garlic.html';
// let firstUrl = 'https://www.made-in-china.com/Agriculture-Food-Catalog/Ginger.html';
let firstUrl = 'https://www.made-in-china.com/Agriculture-Food-Catalog/Onion.html';

let nextUrl = firstUrl;
let page = 1;
// let page = 247;
async function getDetail(link,index,length) {
    // console.log(index);
    // return false;
    // console.log(link);
    let detailResult = await myHttps(link);
    let $ = cheerio.load(detailResult);

    var detail = {};
    // 判断标题
    let title = $('.sr-proMainInfo-baseInfo .J-baseInfo-name').text().trim();
    let title2 = $('.page-product-details .main-info .base-info .pro-name').text().trim();
    detail.title = title||title2;
    detail.page = page;
    // 判断图片
    let imgs = [];
    $('.sr-proMainInfo-slide-pageUl li').each(function () {
        let src = $(this).find('img').data('original').replace(/200/g,'202');
        imgs.push(src);
    });
    if(imgs.length == 0){
        let src = $('.page-product-details .gallary-box .pic-list .hvalign img').attr('src');
        imgs.push(src);
    }
    detail.imgs = imgs.toString();

    // detail.video = $('.sr-proMainInfo-baseInfo .J-baseInfo-name').text().trim();
    let videoSrc = $('.play-mark').next().html();
    let videoImg = $('.J-play-video-btn img').attr('src');
    detail.videoSrc = ''
    detail.videoImg = ''
    if(videoSrc){
        detail.videoSrc = videoSrc
    }
    if(videoImg){
        detail.videoImg = videoImg
    }

    let attr = {};
    $('.sr-proMainInfo-baseInfo-propertyAttr tr').each(function () {
        let key = $(this).find('th').text().replace(':','').replace(/\s/g,'_');
        let value = $(this).find('td').text().trim();
        attr[key] = value
    });
    detail.attr = JSON.stringify(attr);
    let baseInfo = {};
    $('.basic-info-list .bsc-item').each(function () {
        let key = $(this).find('.bac-item-label').text();
        let value = $(this).find('.bac-item-value').text().trim();
        baseInfo[key] = value
    });
    detail.baseInfo = JSON.stringify(baseInfo);
    detail.richText = $('.rich-text').html();
    insertData(detail);

    if(index == length-1){
        getList();
        page++;
    }
}
async function getList() {
    let result = await myHttps(nextUrl);
    let $ = cheerio.load(result);
    nextUrl = 'https:' + $('.pager .next').attr('href');
    let maxListLength = $('.search-list .list-node').length;
    console.log(nextUrl);
    // console.log(maxListLength);

    $('.search-list .list-node').each(function (index) {
        let link = 'https:' + $(this).find('.product-name a').attr('href');
        setTimeout(function () {
            // index<1 && getDetail(link,index,maxListLength)
            getDetail(link,index,maxListLength)
        }, 500*index);
    });
}
getList();
