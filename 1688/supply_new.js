var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var mysql = require('mysql');
var fs = require('fs');
var lib = require('../lib/index.js');
var login = require('./login.js');

var ALL_CATEGORY_LIST_DATA;//所有分类商家列表
var listNum = 1;//所有分类的位置

// 开始
fs.readFile('./data/links.json', 'utf8', function(err,data) {
    ALL_CATEGORY_LIST_DATA = JSON.parse(data);//5262
    lib.eventEmitter.emit('do_spider','init');
});

// 获取新的分类商家列表url
lib.eventListener.on('do_spider', function(data) {
    // tableName = '1688_supplys'+listNum;
    // lib.creditSupplyTable(connection,tableName);

    var tempUrl = ALL_CATEGORY_LIST_DATA[listNum];
    var findChart = tempUrl.indexOf('sid');
    // console.log(tempUrl);
    // console.log(findChart);
    var cid = tempUrl.slice(findChart+3,tempUrl.length);
    // console.log(cid);
    listUrl = 'https://www.alibaba.com/catalogs/corporations/'+ cid +'/';

    var page = 1;//当前分类的页数
    getList(page);

    // if(data == 'init'){
    //     // 登录
    //     login(nightmare,nightmareList);
    // }else{
    //     nightmareList();
    // }
});

var maxPage = 1;
async function getList(page) {
    var url = listUrl+page;
    console.log('列表url:'+url);

    if(page > maxPage){
        console.log('end');
    }

    var result = await lib.myHttps(url);
    var $ = cheerio.load(result);

    maxPage = parseInt($('.m-pagination .next').prev().text());
    // console.log(maxPage);
    // return false;
    $('.m-item').each(function (index) {
        var href = $(this).find('.title a').attr('href').replace('http','https');
        setTimeout(function () {
            if(index == 1){
                getDetail(index,href);
            }
        }, 100*index);
    });
    page++;
    getList(page);
}

async function getDetail(index,href) {
    var result = await lib.myHttps(href);
    var $ = cheerio.load(result);
    // console.log(href);
    console.log('请求内容'+index+'成功');
    var supplyName = $('.title-text').text();
    // 概览数据
    var data = decodeURIComponent($('[module-title=cpCompanyOverview]').attr('module-data'));
    var d = JSON.parse(data);
    // console.log(supplyName);
    // console.log(d.mds.moduleData);
    // fs.writeFile('./d.json', JSON.stringify(d), function(err) {
    //     if (err) console.log(err);
    //     else console.log('写文件操作成功');
    // });

    // 请求产品
    var moduleIds = $('[module-title=selectedProducts]').attr('module-id');
    var script = $('head script').last().html();
    var host_token = script.replace('window.pageConfig=','');

    // console.log(JSON.parse(host_token));
    // return false;
    var product_params = {
        bizId: d.gdc.bizId,
        language: 'en_US',
        envMode: 'product',
        hostToken: 'V1Ih5XX8Au5PumWUxR6RkTlPraBchKNYD0F065o3shUecbAkv5MuAFJW1A8NIjvCcdx7ThJAuzNaQrDHennK5R9A==',
        siteId: d.gdc.siteId,
        pageId: d.gdc.pageId,
        renderType: 'module',
        moduleIds: moduleIds,
    };
    let product_url = 'https://'+d.mds.moduleData.data.esiteSubDomain.value + '/event/app/alisite/render.htm';
    // console.log(product_url);
    // console.log(product_params);
    var result1 = await lib.myHttps(product_url,{
        method:'post',
        data:product_params
    });
    result1 = JSON.parse(result1);
    var products = {};
    products.list = JSON.parse(result1.data[moduleIds].data);
    products.urls = [];
    for(var i=0;i<products.list.data.productList.length;i++){
        var item = products.list.data.productList[i];
        products.urls.push(item.url);
    }
    // console.log(products.urls);
    // console.log(d1);
    // fs.writeFile('./d1.json', JSON.stringify(d1), function(err) {
    //     if (err) console.log(err);
    //     else console.log('写文件操作成功');
    // });
}
