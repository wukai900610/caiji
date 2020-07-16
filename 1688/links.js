var fs = require('fs');

fs.readFile('./data/categories.json', 'utf8', function(err,data) {
    var adata = JSON.parse(data);
    // console.log(adata);
    var links = [];
    for(var i in adata){
        var item = adata[i];
        for(var ii in item){
            var item2 = item[ii];
            if(item2.data){
                // console.log(ii);
                for(var j=0;j<item2.data.length;j++){
                    links.push(item2.data[j].href);
                }
            }
        }
    }

    fs.writeFile('./data/links.json', JSON.stringify(links), function(err) {
        if (err) console.log(err);
        else console.log('写文件操作成功');
    });
});
