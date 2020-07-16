var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var mysql = require('mysql');
var fs = require('fs');
var lib = require('../lib/index.js');

// 创建数据表
var connection = lib.connection();

var listNum = 0;//所有分类的位置
var page = 1;//当前分类的页数
var detailNum;//当前公司在列表的位置
let listData;
var tableName = '1688_supplys';
let pageUrl = 'https://www.alibaba.com/catalog/animal-products_cid100003006?page='+page;
var listUrl;
var maxPage;

// lib.creditSupplyTable(connection,tableName);

const nightmare = Nightmare({
    // show: true
});

function getDetail(detailItem) {
    console.log(detailItem.url);
    nightmare
	.goto(detailItem.url)
    .scrollTo(10000,0)
    .inject('js', '../jquery.js')
    .evaluate(() => {
        var supply = {};
        // 简介
        supply.desc = $('.company-card-desc').html();
        // 公司图上
        var img = $('.image-box .img').css('background');
        if(img){
            var start = img.indexOf('https');
            var end = img.indexOf('")');
            supply.img = img.substring(start,end);
        }
        // 基本信息
        supply.baseInfo = {};
        $('.company-basicInfo tr').each(function () {
            var key = $(this).find('.field-title').text();
            var value = $(this).find('.field-content-wrap').text();
            supply.baseInfo[key] = value;
        });
        // 产品链接
        supply.productsUrl = [];
        $('.next-slick-list .product-image').each(function () {
            var url = $(this).attr('href');
            supply.productsUrl.push(url);
        });
        // 其他信息
        supply.otherContent = {};
        $('.mod-content .content .icbu-shop-table-col-item').each(function () {
            var key = $(this).find('.title').text();
            var value = $(this).find('.content').text();
            supply.otherContent[key] = value;
        });

        return supply;
    })
    .then((data)=>{
        var insert_data = {
            companyName:detailItem.companyName,
            fullCategory:detailItem.fullCategory,
            connectUrl:detailItem.connectUrl,
            baseInfo:JSON.stringify(data.baseInfo),
            img:data.img,
            otherContent:JSON.stringify(data.otherContent),
            productsUrl:data.productsUrl.toString(),
        };
        // console.log(insert_data);
        // console.log();
        lib.insertData(connection,tableName,insert_data);
        detailNum++;

        let nextItem = listData[detailNum];
        if(nextItem && nextItem.url){
            setTimeout(function () {
                // 请求下一条数据
                getDetail(nextItem)
            }, 300);
        }else{
            setTimeout(function () {
                // 请求新列表
                nightmareList();
            }, 2000);
        }
    })
}

function nightmareList() {
    if(page > maxPage) {
        console.log('当前分类下的列表采集完毕');
        // listNum++;
        return;
    };

    // 初始化详情数编号
    listData = [];
    detailNum = 0;

    nightmare
	.goto(listUrl + page)
    // .wait(300)
    .scrollTo(10000,0)
    // .wait(300)
    // .scrollTo(10000,0)
    .inject('js', '../jquery.js')
	.evaluate(() => {
        var data = [];
        var fullCategory = [];
        // 所在目录
        $('.ui-breadcrumb a').each(function () {
            fullCategory.push($(this).text());
        });
        // 列表最大页数
        var maxPage = $('.ui2-pagination .next').prev().text();
        // 列表信息
        $('.m-item').each(function () {
            var companyName = $(this).find('.title ').text().replace(/[\n]/g,'').trim();
            var url = $(this).find('.title a').attr('href');
            var connectUrl = $(this).find('.company .cd').attr('href');
            data.push({
                companyName:companyName,
                url:url,
                connectUrl:connectUrl,
                fullCategory:fullCategory.join('>')
            });
        });

        return {
            data:data,
            maxPage:maxPage
        };
    })
	// .end()
	.then((res)=>{
        listData = res.data;
        maxPage = res.maxPage

        console.log('-------------采集列表页开始,最大'+ maxPage +'当前'+ page +'-------------');
        // console.log(listData);
        console.log('请求列表地址:'+listUrl + page);
        console.log(listData.length);
        // console.log(page);
        console.log('-------------以下是详情页地址-------------');
        page++;
        getDetail(listData[detailNum]);
    })
	.catch(error => {
		console.error('Search failed:', error)
	})
}

// 开始
fs.readFile('./data/links.json', 'utf8', function(err,data) {
    var adata = JSON.parse(data);
    var tempUrl = adata[listNum];
    var findChart = tempUrl.indexOf('sid')
    // console.log(tempUrl);
    // console.log(findChart);
    var cid = tempUrl.slice(findChart+3,tempUrl.length);
    listUrl = 'https://www.alibaba.com/catalogs/corporations/'+ cid +'/'
    // console.log(cid);
    nightmareList();
});
