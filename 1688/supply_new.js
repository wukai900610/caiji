var cheerio = require('cheerio');
var fs = require('fs');
var lib = require('../lib/index.js');

var ALL_CATEGORY_LIST_DATA;//所有分类商家列表
var config = {
    listNum:5205,//所有分类的位置
    page:8,//当前分类的页数
    tableName:'',
    cookie:'t=81a8c9537e3baecf7f42181aa3b9f6ab; cna=Ai0OF825fUACAd9EdAuQ40qG; ali_apache_id=11.179.217.73.1594900814588.463720.9; _ga=GA1.2.1276157287.1594997132; acs_usuc_t=acs_rt=01732bfb762c4feb8edcffefea70fe6b; cookie2=1ee2edc49e84b74e8e58dabc32a38ee5; _tb_token_=5eb8e73338353; _gid=GA1.2.2072834857.1595592615; _samesite_flag_=true; acs_rt=112.0.89.187.1595592624477.5; atm-whl=-1%260%260%260; atm-x=__ll%3D-1; history=company%5E%0A709245414; gangesweb-buckettest=112.0.89.187.1595592662508.7; tfstk=cLCFBQY3eWFFYgR7HBOrOysFuc_dZ4Qhrf-wKt3ec19ESNvhiSmJSyXD7H-Yspf..; _hvn_login=4; csg=83c21c4b; xman_us_t=ctoken=ryog5ij269f4&l_source=alibaba&x_user=1WcfLjlac7ad41MRhjg4GLv3vReftLUPyHOrF4Rv21U=&x_lid=ca1533434232dyhj&sign=y&need_popup=y; xman_us_f=x_locale=en_US&x_l=1&last_popup_time=1595597944818&x_user=CA|Zhao|Lanser|ifm|243659941&no_popup_today=n; intl_locale=en_US; intl_common_forever=VxpnuGFLa6qZnNb/IrOCpDlVDiOmlLLqvqdTR1Hq8hgiALcM003QyA==; xman_f=6d75Zt3iJwQT1n8Uo6GaqF2ZLaRk0mvS0sUHQbCCkZS9TkO18ZObI4bLROMG7Ib82FxIMXeKTn5EdQETzl/o+j/CnyxTy0QNyYmNbIH4GI/vDYiXSd9Fxp6hpusfUA/KPDUwCoLtdclurEmKGcU40M7yYa/duBSJOaZKquFUWvIoGsbCAbqZmngbVzmZdh8TnQ46P6IHmY9EuIEzdpnqltMsDY5KR+8VrrVRH5w6Ba2jb2hMASPsjU1ATXMmytjUp+H8KnRQvktc8Wu23F2yCfsbwa/ZXF+YK21bFZFFLzCJJCd21OWcNH/aOycU7zcHXRpx3bL3G0t+FLq9EqrnKBdJLeZAROdS1BtpKufbtWV07vO4hmdlslH/KGLLQlqzk3JYHAe+iGh5mQg7S8drQg==; ali_apache_tracktmp=W_signed=Y; JSESSIONID=7F0026ECB299580601400F28CB3C9A77; ali_apache_track=mt=1|ms=|mid=ca1533434232dyhj; xman_t=6Y4hRbUAIT6l3tCuXr94Ih7OjDZxgnU6nIiqupC7ovzqGknZnZfwTpf6+SdpPOkwi/DR3FQKmNzPiVX6QTyFA4MR841KwHibeWK+I3CGic+GVJhgC8gocn0acxMMOTxJm7FEc9uJ7Tx6ijc5lDWW8VvwttjeG3Xu7xmAsqe66tYIb7AfQuANQwhhLyLFYm1B1tG6leP2ruSBKQSfjRyZOzp5x3G9LucNkluGSYSU7efXeFXYvh7Hi9xdGHANVNampCRSxlNCt1QP9lpcc2xa47bt8sWu8J8hsvlFX7K0HZf5JPyU+5AM8cEKJdy5XNlDb7OH5Z3ooI1fOMm1cZIl9Rk/qp3hha1h42QZ1OtKAexOtYLVEkP3p86logmAt7hVznnsb91/5aEP6Ar9MhdodG1r+FZN/elchZazzeu1slQSdnqgXm38D/XdAJTOUd/AO8LYhhyQhVMKUkK2D1Kem4SEdFTFQ0ai/PLpwMbrTHY0O7GzZ45mZSaS9tNcGuyjOv58sGzfszTPCGWu44HrtJJso2uGXDJBXwlzQOshD3XYdoFruAuW11R6KbUpFccwhs0FvKyoYTIHTZf2LBRfsDApUAHBxNr2MJHiMrgpmD+fhblVM3pjOZ2gDdIQzSQSMfqPXQqtVGf26CAMhLm+/btjPDlPYelF4tfXmV2omx3HdeSfnlRVUCwlH1oi+Yj64PuS5XRYpms=; _bl_uid=hbk0Fdss0jjapmiFmxpF4yXuXm5z; l=eBa7MUxlOLSlAsHwBO5Z-urza77TyIdf1sPzaNbMiInca61hsFoH9OQqQEj6-dtjgt5mOe-rb3kJjRneP0zLRtigbA135DH2nj9wJe1..; isg=BD09zlY0PkYCmpogLnY4pEcJTJk32nEsLMLWyP-DxRTNNl5oxC7Q_Msg4Gpwtonk',
};

// 开始
fs.readFile('./data/links.json', 'utf8', function(err,data) {
    ALL_CATEGORY_LIST_DATA = JSON.parse(data);//5262
    lib.eventEmitter.emit('do_spider','init');
});

// 创建数据表
var connection = lib.connection();
connection.on('error', function(err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        connection = lib.connection();
    } else {
        throw err;
    }
});

// 获取新的分类商家列表url
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

async function getList() {
    var url = listUrl+config.page;
    console.log('1.列表url:'+url);

    var result = await lib.myHttps(url);
    var $ = cheerio.load(result);

    var maxPage = parseInt($('.m-pagination .next').prev().text());
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
    $('.m-item').each(function (index) {
        var href = $(this).find('.title a').attr('href').replace('http','https');
        var connectUrl = $(this).find('.company .cd').attr('href').replace('http','https');

        // if(index == 0){
            var promiseFun = new Promise((resolve, reject) => {
                setTimeout(function () {
                    var params = {
                        index:index,
                        fullCategory:fullCategory.join('>'),
                        href:href,
                        connectUrl:connectUrl,
                    };
                    getDetail(params,resolve,reject);
                }, 100*index);
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
            setTimeout(function () {
                getList();
            }, 1000);
        }
    }).catch((e)=>{
        console.log(e);
    });
}

async function getDetail(obj,resolve,reject) {
    var result = await lib.myHttps(obj.href);
    var $ = cheerio.load(result);
    // console.log('');
    // console.log(obj.href + ' ' + obj.index);
    // console.log('请求内容'+obj.index+'成功');
    // console.log('');
    var supply = {};
    supply.supplyName = $('.title-text').text();

    // 失败方式1
    if(!supply.supplyName){
        resolve('第'+obj.index + '条读取页面信息失败');
        return false;
    }

    var data = decodeURIComponent($('[module-title=cpCompanyOverview]').attr('module-data'));
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
}
