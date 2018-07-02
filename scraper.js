const fs = require("fs");
const cheerio = require("cheerio");
const csv = require("csv");
const http = require("http");
const moment = require("moment");

// promise based http get
function getTxt(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            const {statusCode} = res;

            if (statusCode !== 200) {
                reject(new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`));
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(rawData);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (e) => {
            reject(new error(`Got error: ${e.message}`));
        });
    }).then(cheerio.load);
}

if(!fs.existsSync("data")){
    fs.mkdirSync("data");
}

function gettshirtInfo(indexPage){
    const urlArray = [];
    indexPage(".products a").each((index, ele) => urlArray.push(`http://shirts4mike.com/${indexPage(ele).attr("href")}`));

    const tshirtsArray = [];
    return Promise.all(urlArray.map(getTxt))
        .then((tshirtTxtArray) => {
            tshirtTxtArray.forEach((ele, index) => {
                //Title, Price, ImageURL, URL, and Time
                const price = ele(".price").text();
                const title = ele(".shirt-details h1").text().replace(price, "").trim();
                const imgUrl = `http://shirts4mike.com/${ele(".shirt-picture img").attr("src")}`;
                const url = urlArray[index];
                const time = moment().format('YYYY-MM-DD h:mm:ss');

                tshirtsArray.push({price, title, imgUrl, url, time});
            });
            return tshirtsArray;
        });
}

function saveAsCsv( tshirtArray ){
    const columns = {
        price: "price",
        title: "title",
        imgUrl: "imgUrl",
        url: "url",
        time: "time"
    };
    csv.stringify(tshirtArray, {header: true, columns: columns}, function(err, output){
        fs.writeFile(`data/${moment().format('YYYY-MM-DD')}.csv`, output , (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    })
}


getTxt("http://shirts4mike.com/shirts.php")
    .then(gettshirtInfo)
    .then(saveAsCsv)
    .catch(console.log);

















