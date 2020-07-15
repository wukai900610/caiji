// var http = require('http');
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
    for (var i in data){
        paramsName = paramsName +',' + i
        values = values + ',?'

        if(typeof(data[i]) == 'object'){
            addSqlParams.push(data[i].toString())
        }else{
            addSqlParams.push(data[i])
        }
    }
    var addSql = 'INSERT INTO globaltradeweek_product(id' + paramsName + ') VALUES(0' + values + ')'
    // return false;
    //增
    connection.query(addSql, addSqlParams, function(err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }
    });
}

// let url = 'https://www.globaltradeweek.com/PageAJAX/Exhibitor.ashx?action=getexhibitorlist';
let url = 'https://www.globaltradeweek.com/PageAJAX/Product.ashx?action=getproductexhibitorlist';
let page = 1;
async function getData() {
    let result = await myHttps(url, {
        method: 'post',
        data: {
            pagesize: 10,
            category: 'All',
            children: 'All',
            page: page
        }
    });
    result = JSON.parse(result);

    result.data.list.map(function (item,index) {
        // 向数据库插入
        insertData(item);
    });

    page++;
    if (page <= 1135) {
        setTimeout(function() {
            console.log('获取第'+page+'页数据');
            getData();
        }, 1000);
    }
}
getData();
// connection.end();
