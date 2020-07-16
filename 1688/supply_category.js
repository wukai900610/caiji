var fs = require('fs');
var cheerio = require('cheerio');
var lib = require('../lib/index.js');

let url = 'https://www.alibaba.com/companies';
async function getCategory() {
    let result = await lib.myHttps(url);
    let $ = cheerio.load(result);

    var category = [];
    $('.g-cate-list').each(function (index) {
        $(this).find('dl').each(function () {
            let href = $(this).find('dd a').last().attr('href');
            // let text = $(this).find('dd a').last().text().trim();
            category.push({
                href:href,
            })
            // console.log(href);
            // console.log(text);
        });
    });

    fs.writeFile('./data/category.json', JSON.stringify(category), function(err) {
        if (err) console.log(err);
        else console.log('写文件操作成功');
    });
}
getCategory();
