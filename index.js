// 客户端请求代理模块
const superagent = require('superagent');
// nodejs中的jquery
const cheerio = require('cheerio');
const url = require('url');
const eventproxy = require('eventproxy');
const hupuUrl = 'https://bbs.hupu.com/';
const loading = 'https://b1.hoopchina.com.cn/web/sns/bbs/images/placeholder.png';
for (let i = 0; i <= 4; i++) {
    let listUrl = hupuUrl.concat('selfie-', i);
    const contentUrls = [];
    superagent.get(listUrl).end((err, res) => {
        if (err) {
            return console.error(err);  
        }  
        const $ = cheerio.load(res.text);
        $('#container .for-list .truetit').each((index, element) => {
            let ele = $(element);
            let href = url.resolve(hupuUrl, ele.attr('href'));
            contentUrls.push(href)
        })
        
        const ep = new eventproxy();

        ep.after('spider', contentUrls.length, content => {
            const obj = content.map(item => {
                const $ = cheerio.load(item[1])
                const arr = []
                let username = $('#tpc .author .u').text().trim();
                $('.quote-content>p>img').each((index, element) => {
                    let ele = $(element);
                    if (ele.attr('src') === loading) {
                        arr.push(ele.attr('data-original'))
                    } else {
                        arr.push(ele.attr('src'))                        
                    }
                })
                return {
                    username,
                    pics: arr,
                    url: item[0],
                }    
            })
            console.log(obj)
        })

        contentUrls.forEach(item => {
            superagent.get(item).end((err, res) => {
                if (err) {
                    return console.error(err);  
                }
                ep.emit('spider', [item, res.text]);
            })
        })
        

    })
}