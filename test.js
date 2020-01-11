const fs = require('fs');

let writeStream = fs.createWriteStream('test.txt');
console.dir(writeStream);
