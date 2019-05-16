const fs = require('fs')
const ans = JSON.parse(fs.readFileSync('test.json','utf8'))
console.log(
  ans.filter(function(e){
    return e > 0
  }).length
)
