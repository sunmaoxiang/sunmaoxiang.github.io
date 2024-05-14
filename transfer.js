var fs = require('fs')

var m = {};
var htstr = "";

process.argv.forEach(function (val, index, array) {
    // val : ./2024.5/xx.html
    // arr: [".","2024.5","xx.html"]
    var arr = val.split('/')
    if (arr.length == 3) {
        if (!m[arr[1]]) m[arr[1]] = [];
        m[arr[1]].push({ txt: arr[2], href: val });
    }
});
/*
 m:{
     '2024.1':[{txt:xxx.html,href:'./2024.1/xx.html'},{...}],
     '2024.2':...
 }
*/

// sort keys 
var keys = Object.keys(m).sort((a, b) => { return parseInt(a.replace('.', '')) - parseInt(b.replace('.', '')) })

var sectionstr = "<section>";

for (const date_ of keys) {
    // 遍历每个数组元素的属性
    m[date_].forEach((element) => {
        // 访问每个元素的属性
        sectionstr += 
        `
        <p><a href='${element.href}'>${date_}_${element.txt}</a></p>
        `;

    });
}
sectionstr += "</section>"

htstr="<div id=\"content\" class=\"container\">\n"+sectionstr+"\n</div>"
fs.writeFileSync('./index.html', fs.readFileSync('./index.html').toString().replace(/<div id="content"([\s\S])*\/div>/gm, htstr));