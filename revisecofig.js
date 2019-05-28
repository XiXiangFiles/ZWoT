
const request = require('request')
request(`http://172.17.0.1:3000/zwot`, function (_error, response, body) { 
  const fs = require('fs')
  const now = require('date-now')
  const config = JSON.parse(body)
  const newInstance = config.Instance + now()
  const oldInstance = config.Instance
  config.Instance = newInstance
  config.A.name = newInstance + '.local'
  for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
    try {
      config.WoTs[Object.keys(config.WoTs)[i]].SRV.target = config.A.name
      if (oldInstance === Object.keys(config.WoTs)[i]) {
        config.WoTs[config.Instance] = config.WoTs[Object.keys(config.WoTs)[i]]
      }
    } catch (e) {
    }
  }
  delete config.WoTs[oldInstance]
  let wots = {}
  for (let j = Object.keys(config.WoTs).length; j >= 0; j--) {
    wots[Object.keys(config.WoTs)[j]] = config.WoTs[Object.keys(config.WoTs)[j]]
  }
  config.WoTs = wots
  fs.writeFileSync('config.json', JSON.stringify(config))
})
