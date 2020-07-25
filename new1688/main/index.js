var cheerio = require('cheerio');
var fs = require('fs');
var lib = require('../../lib/index.js');

var ALL_CATEGORY_LIST_DATA;//所有分类商家列表
var config = {
    listNum:5000,//所有分类的位置
    page:1,//当前分类的页数
    tableName:'',
    cookie:'t=81a8c9537e3baecf7f42181aa3b9f6ab; cna=Ai0OF825fUACAd9EdAuQ40qG; ali_apache_id=11.179.217.73.1594900814588.463720.9; _ga=GA1.2.1276157287.1594997132; _gid=GA1.2.2072834857.1595592615; gangesweb-buckettest=112.0.89.187.1595592662508.7; xman_us_f=x_locale=en_US&x_l=1&last_popup_time=1595597944818&x_user=CA|Zhao|Lanser|ifm|243659941&no_popup_today=n; history=company%5E%0A709245414%24%0A243432804; acs_usuc_t=acs_rt=4296ec98077742d290b0a8bc719fa55f; cookie2=124f44a2257a7c7dc14ce680fbbad7df; _tb_token_=ff5e896ebe33f; _samesite_flag_=true; _bl_uid=Lgkkhd160jmundkOhe6ahwt4q1es; _hvn_login=4; csg=ed0b743b; xman_us_t=ctoken=3z9mm1mefs62&l_source=alibaba&x_user=CGLqrUMjw7i99AQzzD8hlKyOxa07J1/TrBw90eGldy8=&x_lid=ca1533434232dyhj&sign=y&need_popup=y; intl_locale=en_US; intl_common_forever=E+ti80ppTQg0DKGoh74Rzm+4d8vnJQKYwAMDMPufLC7ShO06LXnxQw==; xman_f=e111qJwK7lvmSgUbKV/VRqWtlKGFMLh3Fko5xDucuNoaCUVVKNRRJYUqfSNw/QXR3vOuACtYazfP0H8svcPEEdMdga5tsZjc4tUfezyWqrfKb4L1KVSq9aNPtx+QaS2LmIAuMs9UZ7Yju13lqFIQizfSRW+sSJAgAzlD6RKhOs8fb9ZH/nb/32N9mEidLoUduVBDSjhuscvNob/DZIiPmu7d1CxskEmhB+P292KCS8C5Epeq+iH0rlBU3YGHgJ0v63dzLO/PIs7f/vg33lrJSHpX6H44s7fyQxU4teTUS3Vt2GODVxvptbvJuemCPmiYq/QnswHB1C5s08jxdScwxMB308YF7caR8a28MVOMP0ShakaE+Pz3LMUE7yfVGK3KknNyS8M5zUYD6WDylvMj8A==; ali_apache_tracktmp=W_signed=Y; JSESSIONID=232BDF809031C8A3B9301F2B8263AE21; tfstk=c0K1BAmTA5VsdI34bdMF_fJnA1SVaYy5hV6vCe-cmQQxTWph9sm84_69bEVuvaBC.; ali_apache_track=mt=1|ms=|mid=ca1533434232dyhj; xman_t=bb58JSE1ePQbCI7h1GHlmeW2Qhq57tYJDwzFR2s/7qoK3bQrlIa6Lu3EY5xw3Mwxzd+JK7CQyr6TfKN31ox0gUBTtntO23/x4e/TH/uVcsiR9LWU84Wkel8QQKrRJweAeqLh5/uU8QEqh0xFGCHlxyQLvkM5Z3bKDFg+UUqNy5nHjYYjvl7vhOo02KAYT1i8/ufU3fMTje7U7hteF9cpeSXzQTXcZyaCcSCSWv8Oi0nkPMF0iLRPgs7614Saj2UkEeOlUfUCcLmMoNSR3tSUIkNkjGas5dsKOl5EouuOnm/vGa1rQisOc7zzw09hX+Bs6DuxIqWiwRj9axW+iFJ6V7qtEc6ttp8bsAY6hds8LFVJdcxsTzustJWejGzOGuHC6JoY3gKvzBL/PRFN2d5Xg0KnJ0FAVTxwp+mCMAHybmnpkhaQricc5fP03d/6PtpHhN3LvpN4KIXF5M9CLh9Pxn/eLqfJzperetA5FrZLoAex1TmvkYcl1yF3P5B2O4xhFFhBND4S3oy1Tlk9mGwkk2XSldW89vTx0TaZks4pIpwIfD7jwlHo1d2V+TnmWrpQhF/lUw6t79dQh37dpykHUtahzrLctVpaHjuSPK48xPQcpw2YtzcAeHkBoUVo8nT+s0ju+dUAj9au/G6Ge9MK/QO/faFJ1NO4mfiLNl+Eu1ifd7m2oubfSB+t6CHIF5Fiqhog1CGdv0w=; l=eBa7MUxlOLSlA3wwBO5Cnurza77TqIObzsPzaNbMiInca6_hZFOOpNQqIkRXodtjgtfvYetrb3kJjRFXP_UKgSUWolv4qG45cxJ6-; isg=BMDAtd3li5iDUXeXqwXtK2pKkU6SSaQTEeH73zpQwFtvtWLf4l1Ko_RDzR11BVzr',
};

// 1.开始
fs.readFile('../../1688/data/links.json', 'utf8', function(err,data) {
    ALL_CATEGORY_LIST_DATA = JSON.parse(data);//5262

    // 读取配置
    fs.readFile('./config.json', 'utf8', function(err,data2) {
        // console.log(data2);
        if(err){
            console.log('读取配置不存在，使用初始数据');
            lib.eventEmitter.emit('do_spider','init');
        }else{
            // console.log(data2);
            if(data2 != '' || data2 != undefined){
                config = JSON.parse(data2);
                // fs.unlinkSync('./config.json');
                lib.eventEmitter.emit('do_spider','init');
            }
        }
    });
});

// 2.创建数据表
var connection = lib.connection();
connection.on('error', function(err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        connection = lib.connection();
    } else {
        throw err;
    }
});

// 3.获取新的分类商家列表url
lib.eventListener.on('do_spider', function(data) {
    config.tableName = '1688_supplys'+config.listNum;
    lib.creditSupplyTable(connection,config.tableName);

    var tempUrl = ALL_CATEGORY_LIST_DATA[config.listNum];
    var findChart = tempUrl.indexOf('sid');
    // console.log(tempUrl);
    // console.log(findChart);
    var cid = tempUrl.slice(findChart+3,tempUrl.length);
    // console.log(cid);
    listUrl = 'https://www.alibaba.com/catalogs/corporations/'+ cid +'/';

    console.log('分类'+config.listNum+'开始采集');
    getList();

    // if(data == 'init'){
    //     // 登录
    //     login(nightmare,nightmareList);
    // }else{
    //     nightmareList();
    // }
});

function endProgram() {
    console.log('中止程序,准备重启');

    fs.writeFile('./config.json', JSON.stringify(config), function(err) {
        if (err) {
            console.log(err);
        }else{
            console.log('中止程序前配置文件保存成功');
            process.exit(0);//主动中止程序
        }
    });
}

// 4.列表
async function getList() {
    var url = listUrl+config.page;
    console.log('1.列表url:'+url);

    var result = await lib.myHttps(url);
    var $ = cheerio.load(result);

    var maxPage = parseInt($('.m-pagination .next').prev().text());
    if(isNaN(maxPage)){
        console.log('maxPage为空，页面被屏蔽');
        endProgram();
        return false;
    }
    console.log('2.当前分类最大页数:'+maxPage+' 当前时间:'+lib.getTime());
    // console.log(maxPage);
    // return false;

    // 所在目录
    var fullCategory = [];
    $('.ui-breadcrumb a').each(function () {
        fullCategory.push($(this).text());
    });

    var promiseArr = [];
    console.log('3.本页最大数量:'+$('.m-item').length);
    console.log('4.当前分类:'+config.listNum);
    $('.m-item').each(function (index) {
        var supplyName = $(this).find('.title a').text().trim();
        var href = $(this).find('.title a').attr('href').replace('http','https');
        var connectUrl = $(this).find('.company .cd').attr('href').replace('http','https');

        // 重写url
        var start = href.indexOf('/member');
        var end = href.indexOf('/company_profile');
        if(start>0 && end>0){
            var tempUrl = href.substring(start+8,end);
            href = 'https://'+tempUrl+'.fm.alibaba.com/company_profile.html#top-nav-bar'
            connectUrl = 'https://'+tempUrl+'.fm.alibaba.com/contactinfo.html'
        }

        // if(index == 0){
            var promiseFun = new Promise((resolve, reject) => {
                // var params = {
                //     index:index,
                //     fullCategory:fullCategory.join('>'),
                //     supplyName:supplyName,
                //     href:href,
                //     connectUrl:connectUrl,
                // };
                // getDetail(params,resolve,reject);
                setTimeout(function () {
                    var params = {
                        index:index,
                        fullCategory:fullCategory.join('>'),
                        supplyName:supplyName,
                        href:href,
                        connectUrl:connectUrl,
                    };
                    getDetail(params,resolve,reject);
                }, 200*index);
            });
            promiseArr.push(promiseFun);
        // }
    });

    Promise.all(promiseArr).then((values) => {
        console.log(values);
        console.log('');
        config.page++;

        if(config.page >= maxPage){
            console.log('类目'+config.listNum+'采集 end');
            console.log('');
            console.log('');
            console.log('');

            config.listNum++;
            config.page=1;
            lib.eventEmitter.emit('do_spider');
        }else{
            // setTimeout(function () {
            //     getList();
            // }, 2500);
            getList();
        }
    }).catch((e)=>{
        console.log(e);
    });
}

// 5.内容
async function getDetail(obj,resolve,reject) {
    var result = await lib.myHttps(obj.href);
    var $ = cheerio.load(result);
    // console.log('');
    // console.log(obj.href + ' ' + obj.index);
    // console.log('请求内容url'+obj.index+'成功');
    // console.log('');

    var supply = {};
    supply.supplyName = obj.supplyName;

    // 检测页面是否被屏蔽
    var Ouch = $('.error-copy h1').text();
    if(Ouch == 'Ouch...'){
        console.log('错误1');
        endProgram();
        return false;
    }

    try {
        // var data;
        // var d;
        // try {
        //     data = decodeURIComponent($('[module-title=cpCompanyOverview]').attr('module-data'));
        //     d = JSON.parse(data);
        // } catch (e) {
        //     console.log(e);
        //     console.log(data);
        //
        //     console.log('失败' + obj.href + ' ' + obj.index);
        //     console.log('');
        // } finally {
        //
        // }
        var data = decodeURIComponent($('[module-title=cpCompanyOverview]').attr('module-data'));
        // 失败方式1
        if(data == 'undefined'){
            // console.log('失败' + obj.href + ' ' + obj.index);
            // console.log('');
            resolve('第'+obj.index + '条读取页面信息失败：' + obj.href);
            return false;
        }
        var d = JSON.parse(data);
        // console.log(d.mds.moduleData);
        // fs.writeFile('./d.json', JSON.stringify(d), function(err) {
        //     if (err) console.log(err);
        //     else console.log('写文件操作成功');
        // });

        // 0.产品图片
        supply.imgs = [];
        if(d.mds.moduleData.data.companyAboutUsImg && d.mds.moduleData.data.companyAboutUsImg.value){
            supply.imgs = d.mds.moduleData.data.companyAboutUsImg.value;
        }
        // 1.概览数据
        supply.baseInfo = {};
        for(var i in d.mds.moduleData.data){
            var item = d.mds.moduleData.data[i];
            if(item.title){
                if(typeof(item.value) == 'object'){
                    supply.baseInfo[item.title] = JSON.stringify(item.value);
                }else{
                    supply.baseInfo[item.title] = item.value;
                }
            }
        }
        // console.log(supply.baseInfo);

        // 2.otherContent
        supply.otherContent = {};
        $('.mod-content .content .icbu-shop-table-col-item').each(function () {
            var key = $(this).find('.title').text().trim();
            var value = $(this).find('.content').text().trim();
            supply.otherContent[key] = value;
        });
        // console.log(supply.otherContent);

        // 请求产品数据前置条件
        var moduleIds = $('[module-title=selectedProducts]').attr('module-id') || $('[module-title=cpProduct]').attr('module-id');
        var script = $('head script').last().html();
        var host = script.replace('window.pageConfig=','');
        host = JSON.parse(lib.ext_json_decode(host));
        // console.log(host);
        // 3.请求产品
        // resolve();
        // return false;
        var product_params = {
            bizId: d.gdc.bizId,
            language: 'en_US',
            envMode: 'product',
            // hostToken: 'V1Ih5XX8Au5PumWUxR6RkTlPraBchKNYD0F065o3shUecbAkv5MuAFJW1A8NIjvCcdx7ThJAuzNaQrDHennK5R9A==',
            hostToken: host.token,
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
        var products = JSON.parse(result1.data[moduleIds].data);
        supply.products_list = [];
        for(var i=0;i<products.data.productList.length;i++){
            var item = products.data.productList[i];
            supply.products_list.push(item.url);
        }
        // console.log(products.urls);

        // 4.联系信息
        var result2 = await lib.myHttps(obj.connectUrl);
        var $2 = cheerio.load(result2);
        var contact = decodeURIComponent($2('[module-title=contactPerson]').attr('module-data'));
        // 失败方式2
        if(contact == 'undefined'){
            resolve('第'+obj.index + '条读取页联系方式失败');
            return false;
        }
        var contact_info = JSON.parse(contact).mds.moduleData.data;
        // console.log(contact_info.encryptAccountId)
        // contact_info.encryptAccountId = 'IDX1EZOGuw25yMLPsFUtbTZjz7iWOenP4RfxaWdtXtQ_czV6wgrhMd-vgLg_y9jFPggy'
        // 登录获取联系信息
        var connect_url = 'https://'+d.mds.moduleData.data.esiteSubDomain.value+'/event/app/contactPerson/showContactInfo.htm?encryptAccountId='+contact_info.encryptAccountId;
        // console.log(connect_url);
        var result3 = await lib.myHttps(connect_url,{
            headers:{
                cookie:config.cookie,
            }
        });
        // console.log(result3);
        if(result3){
            result3 = JSON.parse(result3);
        }
        // console.log(result3);
        // return false;

        var insertData = {
            fullCategory:obj.fullCategory,
            companyName:supply.supplyName,
            imgs:supply.imgs.toString(),
            productsUrl:supply.products_list.toString(),
            baseInfo:JSON.stringify(supply.baseInfo),
            otherContent:JSON.stringify(supply.otherContent),
            connectInfo:JSON.stringify(result3.contactInfo),
        };
        // console.log(insertData);

        lib.insertData(connection,config.tableName,insertData);

        resolve('数据'+obj.index+' ok');
        // console.log(d1);
        // fs.writeFile('./d1.json', JSON.stringify(d1), function(err) {
        //     if (err) console.log(err);
        //     else console.log('写文件操作成功');
        // });
    } catch (e) {
        console.log('错误2');
        console.log(e);
        endProgram();
    }
}
