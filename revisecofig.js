const fs = require('fs')
const now = require('date-now')
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
const newInstance = config.Instance + now()
const oldInstance = config.Instance
config.Instance = newInstance
config.A.name = newInstance + '.local'
for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
  try {
    config.WoTs[Object.keys(config.WoTs)[i]].SRV.target = config.A.name
    if (oldInstance === Object.keys(config.WoTs)[i]) {
      config.WoTs[config.Instance] = config.WoTs[Object.keys(config.WoTs)[i]]
      delete config.WoTs[oldInstance]
    }
  } catch (e) {
  }
}
console.log(JSON.stringify(config))
fs.writeFileSync('config.json', JSON.stringify(config))
