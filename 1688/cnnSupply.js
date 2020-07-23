var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var mysql = require('mysql');
var fs = require('fs');
var lib = require('../lib/index.js');
var login = require('./login.js');

var ALL_CATEGORY_LIST_DATA;//所有分类商家列表
var listNum = 8;//所有分类的位置
var page = 4;//当前分类的页数
var detailNum;//当前公司在列表的位置
var listData;
var tableName;
var listUrl;
var maxPage;

// 创建数据表
var connection = lib.connection();

const nightmare = Nightmare({
    // show: true
});

// 采集下一页的商家详情
function nextDetail() {
    console.log('采集下一页');
    detailNum++;
    let nextItem = listData[detailNum];
    if(nextItem && nextItem.url){
            // 请求下一条数据
            getDetail(nextItem)
    }else{
        setTimeout(function () {
            // 请求新列表
            nightmareList();
        }, 2000);
    }
}

// 获取当前商家的联系详情
function connectInfo(connectUrl,insertData) {
    nightmare
	.goto(connectUrl)
    // .wait(300)
    // .wait(300)
    .inject('js', '../jquery.js')
    // .wait('.sens-mask .icbu-link-default')
    .click('.sens-mask .icbu-link-default')
    .wait(100)
	.evaluate(() => {
        // 联系信息
        var connectData = {};
        $('.info-table tr').each(function () {
            var key = $(this).find('th').text().trim();
            var value = $(this).find('td').text().trim();
            connectData[key] = value;
        });
        // 公司联系信息
        $('.contact-table .info-item').each(function () {
            var key = $(this).find('.item-title').text().trim();
            var value = $(this).find('item-value').text().trim();
            connectData[key] = value;
        });
        return connectData;
    })
	// .end()
	.then((data)=>{
        // console.log(data);
        insertData.connectInfo = JSON.stringify(data);
        lib.insertData(connection,tableName,insertData);

        nextDetail();
    })
	.catch(error => {
        console.error('connectInfo出错', error);
        nextDetail();
	})
}

// 获取当前商家的详情
function getDetail(detailItem) {
    console.log(detailItem.url);
    nightmare
	.goto(detailItem.url)
    .scrollTo(10000,0)
    .inject('js', '../jquery.js')
    .exists(".image-box .img")
    .then(function (result) {
        if (result) {
            return nightmare.click('.image-box .img')
        } else {
            console.log("公司图片不存在 image-box .img")
        }
    })
    .then(()=>{
        return nightmare.evaluate(() => {
        var supply = {};
        // 简介
        supply.desc = $('.company-card-desc').html();
        // 公司图上
        supply.imgs = [];
        $('.bc-image-viewer .image-box .image').each(function () {
            var img = $(this).attr('src')
            supply.imgs.push(img);
        });
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
    })
    .then((data)=>{
        var insert_data = {
            companyName:detailItem.companyName,
            fullCategory:detailItem.fullCategory,
            baseInfo:JSON.stringify(data.baseInfo),
            otherContent:JSON.stringify(data.otherContent),
            imgs:data.imgs.toString(),
            productsUrl:data.productsUrl.toString(),
        };
        // 抓取联系信息
        connectInfo(detailItem.connectUrl,insert_data)

        // lib.insertData(connection,tableName,insert_data);

        // detailNum++;

        // let nextItem = listData[detailNum];
        // if(nextItem && nextItem.url){
        //     setTimeout(function () {
        //         // 请求下一条数据
        //         // getDetail(nextItem)
        //     }, 300);
        // }else{
        //     setTimeout(function () {
        //         // 请求新列表
        //         nightmareList();
        //     }, 2000);
        // }
    })
    .catch(error => {
        console.error('getDetail出错', error)
        nextDetail();
	})
}

// 遍历当前分类商家下的所有列表
function nightmareList() {
    if(page > maxPage) {
        console.log('当前分类下的列表采集完毕,the end...');
        console.log('');
        console.log('');
        console.log('');
        console.log('');
        listNum++;
        page=1;
        lib.eventEmitter.emit('do_spider');
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
        maxPage = res.maxPage||1;

        console.log('');
        console.log('');
        console.log('');
        console.log('当前第'+listNum+'个分类');
        console.log('→→→→→→→→→→→→采集列表页开始,最大'+ maxPage +',当前'+ page +'←←←←←←←←←←←←');
        // console.log(listData);
        console.log('请求列表地址:'+listUrl + page);
        console.error('本页列表数量:'+listData.length);
        // console.log(page);
        console.log('↓↓↓↓↓↓↓↓↓↓↓↓以下是详情页地址↓↓↓↓↓↓↓↓↓↓↓↓');
        page++;
        // console.log(listData);
        if(listData.length > 0){
        getDetail(listData[detailNum]);
        }else{
            // 列表无数据 采集下一分类
            listNum++;
            page=1;
            lib.eventEmitter.emit('do_spider');
        }
    })
	.catch(error => {
        console.error('nightmareList', error)
	})
}

// 获取新的分类商家列表url
lib.eventListener.on('do_spider', function(data) {
    tableName = '1688_supplys'+listNum;
    lib.creditSupplyTable(connection,tableName);

    var tempUrl = ALL_CATEGORY_LIST_DATA[listNum];
    var findChart = tempUrl.indexOf('sid');
    // console.log(tempUrl);
    // console.log(findChart);
    var cid = tempUrl.slice(findChart+3,tempUrl.length);
    // console.log(cid);
    listUrl = 'https://www.alibaba.com/catalogs/corporations/'+ cid +'/'

    if(data == 'init'){
        // 登录
    login(nightmare,nightmareList);
    }else{
        nightmareList();
    }
});
// 开始
fs.readFile('./data/links.json', 'utf8', function(err,data) {
    ALL_CATEGORY_LIST_DATA = JSON.parse(data);//5262
    lib.eventEmitter.emit('do_spider','init');
});
