const fs = require('fs')
const now = require('date-now')
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
const newInstance = config.Instance + now()
config.Instance = newInstance
config.A.name = newInstance + '.local'
for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
  try {
    config.WoTs[Object.keys(config.WoTs)[i]].SRV.target = config.A.name
  } catch (e) {
  }
}
console.log(JSON.stringify(config))
