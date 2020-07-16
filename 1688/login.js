// var Nightmare = require('nightmare');
// var cheerio = require('cheerio');
// var lib = require('../lib/index.js');

function login(nightmare,callback) {
    // const nightmare = Nightmare({
    //     show: true
    // });

    nightmare
	.goto('https://passport.alibaba.com/icbu_login.htm')
    // .wait(300)
    // .wait(300)
    // .inject('js', '../jquery.js')
    .wait('#fm-login-id')
    .wait('#fm-login-password')
    .wait('#fm-login-submit')
    .type('#fm-login-id', '2853706505@qq.com')
    .type('#fm-login-password', 'uaec!@#124')
    .click('#fm-login-submit')
	.evaluate(() => {
        var data = [];

        return data;
    })
	// .end()
	.then((data)=>{
        setTimeout(function () {
            callback();
        }, 5000);
    })
	.catch(error => {
		console.error('login fail', error)
	})
}
module.exports = login;
// login();
