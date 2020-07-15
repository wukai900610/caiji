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

let url = 'https://www.alibaba.com/Products';

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

    var category = [];
    $('.sub-item').each(function (index) {
        let category2Name = $(this).find('.sub-title a').text().trim();

        var category3data = [];
        $(this).find('.sub-item-cont li').each(function () {
            let href = $(this).find('a').attr('href');
            let text = $(this).find('a').text().trim();
            category3data.push({
                href:href,
                text:text,
            })
        });
        category.push({
            category2Name:category2Name,
            children:category3data
        });

        // setTimeout(function () {
        //     getDetailCategory(href,text)
        //     // index <1 && getDetailCategory(href,text)
        // }, 500*index);
    });

    fs.writeFile('./category/1688/category.json', JSON.stringify(category), function(err) {
        if (err) console.log('写文件操作失败');
        else console.log('写文件操作成功');
    });
}
getCategory();
