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

let url = 'https://www.made-in-china.com/prod/catlist/';

// let page = 1;
async function getDetailCategory(link,categoryParentName) {
    let detailResult = await myHttps(link);
    let $ = cheerio.load(detailResult);

    let childCategory = [];
    $('.all-catlog-classification .items-line-lists .item').each(function (index) {
        let href = 'https:' + $(this).attr('href');
        let text = $(this).text();

        // console.log(text);
        // console.log(href);
        childCategory.push({
            href:href,
            text:text,
        })
    });

    fs.writeFile('./category/'+categoryParentName+'.json', JSON.stringify(childCategory), function(err) {
        if (err) console.log('写文件操作失败');
        else console.log('写文件操作成功');
    });
}
async function getCategory() {
    let result = await myHttps(url);
    let $ = cheerio.load(result);

    $('.sec-title').each(function (index) {
        let href = 'https:' + $(this).find('a').attr('href');
        let text = $(this).find('a').text();

        setTimeout(function () {
            getDetailCategory(href,text)
            // index <1 && getDetailCategory(href,text)
        }, 500*index);
        // console.log(href);
        // console.log(text);
    });
    return false;
}
getCategory();
