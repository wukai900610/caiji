var Nightmare = require('nightmare');
var cheerio = require('cheerio');
var fs = require('fs');
var lib = require('../lib/index.js');

function login() {
    nightmare
	.goto('https://passport.alibaba.com/icbu_login.htm')
    // .wait(300)
    // .wait(300)
    .inject('js', '../jquery.js')
    .wait('.login-content')
    .type('#fm-login-id', '2853706505@qq.com')
    .type('#fm-login-password', 'uaec!@#124')
    .click('.pw-loginBtn')
	.evaluate(() => {
        var data = [];

        return data;
    })
	// .end()
	.then((data)=>{
        listData = data;
        // console.log('-----------start------------');
        // console.log(listData);
        // console.log(listData.length);
        // console.log(page);
        // console.log('');
        // page++;
        getDetail(listData[detailNum]);

        // if(page<100){
        //     page++;
        //     setTimeout(function () {
        //         nightmareList();
        //     }, 30000);
        // }
    })
	.catch(error => {
		console.error('Search failed:', error)
	})
}
login();
