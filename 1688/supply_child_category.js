var fs = require('fs');
var cheerio = require('cheerio');
var Nightmare = require('nightmare');
var lib = require('../lib/index.js');

var index = 0;
var categories = {};

var nightmare = Nightmare({
    show: true
});

async function creditCategory(data) {
    // console.log(index);
    if(index<data.length-1){
        var item = data[index];
        var url = item.href.replace('http','https');
        console.log(url);

        nightmare
    	.goto(url)
        // .wait(300)
        // .scrollTo(5000,0)
        // .wait(300)
        // .scrollTo(10000,0)
        .inject('js', '../jquery.js')
    	.evaluate(() => {
            var category = $('.g-width-790 .ui-box-title').text();
            // categories[category] = {};
            var data = {}
            var tempCategory2 = '';
            $('#category-main-box .g-float-left>ul>li').each(function () {
                var category2 = $(this).find('>a').text();
                if(category2){
                    data[category2] = {};
                    tempCategory2 = category2;
                }else{
                    var category3 = [];

                    $(this).find('>ul>li').each(function () {
                        var href = $(this).find('>a').attr('href');
                        var name = $(this).find('>a').text();
                        if(href){
                            category3.push({
                                name:name,
                                href:href
                            })
                        }else{
                            $(this).find('>ul>li').each(function () {
                                var href = $(this).find('>a').attr('href');
                                var name = $(this).find('>a').text();
                                category3.push({
                                    name:name,
                                    href:href
                                })
                            });
                        }
                    });
                    data[tempCategory2].data = category3;
                }
            });

            return {
                category:category,
                data:data,
            };
        })
        .then((res)=>{
            index++;
            categories[res.category] = res.data
            setTimeout(function () {
                creditCategory(data);
            }, 500);
        })
        .catch(error => {
    		console.error('error:', error)
            index++;
            setTimeout(function () {
                console.log('继续');
                creditCategory(data);
            }, 500);
    	})
        // // 必须用https请求 否则不返回数据
        // var result = await lib.myHttps(url);
        // console.log(url);
        // var $ = cheerio.load(result);
        // var category = $('.g-width-790 .ui-box-title').text();
        // categories[category] = {};
        // var tempCategory2 = '';
        // $('#category-main-box .g-float-left>ul>li').each(function () {
        //     var category2 = $(this).find('>a').text();
        //     if(category2){
        //         categories[category][category2] = {};
        //         tempCategory2 = category2;
        //     }else{
        //         var category3 = [];
        //
        //         $(this).find('>ul>li').each(function () {
        //             var href = $(this).find('>a').attr('href');
        //             var name = $(this).find('>a').text();
        //             if(href){
        //                 category3.push({
        //                     name:name,
        //                     href:href
        //                 })
        //             }else{
        //                 $(this).find('>ul>li').each(function () {
        //                     var href = $(this).find('>a').attr('href');
        //                     var name = $(this).find('>a').text();
        //                     category3.push({
        //                         name:name,
        //                         href:href
        //                     })
        //                 });
        //             }
        //         });
        //         categories[category][tempCategory2].data = category3;
        //     }
        // });

        // 测试
        // fs.writeFile('./data/categories.json', JSON.stringify(categories), function(err) {
        //     if (err) console.log(err);
        //     else console.log('写文件操作成功');
        // });
    }else{
        fs.writeFile('./data/categories.json', JSON.stringify(categories), function(err) {
            if (err) console.log(err);
            else console.log('写文件操作成功');
        });
    }
}
function getChildCategory() {
    fs.readFile('./data/category.json', 'utf8', function(err,data) {
        creditCategory(JSON.parse(data));
    });
}
getChildCategory();
