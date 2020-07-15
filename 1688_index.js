// var http = require('http');
var fs = require('fs');
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
    var addSql = 'INSERT INTO 1688_product_agriculturalWaste(id' + paramsName + ') VALUES(0' + values + ')'
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

let files = [];
let num = 25;
async function getDetail(url) {
    console.log(num);
    console.log(url);
    let result = await myHttps(url);
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

    insertData({
        imgs:imgs.toString(),
        videoSrc:videoSrc||'',
        videoImg:videoImg||'',
        title:title,
        priceRange:priceRange,
        minOrder:minOrder,
        payments:payments,
        overview:JSON.stringify(overview),
        richText:richText,
        num:num
    });
    num++;

    let nextUrl = files[num]
    if(nextUrl){
        setTimeout(function () {
            getDetail(nextUrl)
        }, 500);
    }

}
async function getList() {
    fs.readFile('./category/1688/list.txt', 'utf8', function(err,data) {
        files = data.split(/[\r\n]/g);

        getDetail(files[num])
    });
}
getList();
