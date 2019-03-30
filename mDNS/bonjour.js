const color = require('../node_modules/colors')
const wtm = require('../wtm')
const { mdns } = require('./server')
function bonjour () {
  this.init = function () {
    const ip = require('ip')
    const config = wtm.getConfig({ configPath: '', rootPath: 'public/' })
    const listServicewithIns = []
    const listService = []
    const srv = new Map()
    const txt = new Map()
    config.A.data = ip.address()
    wtm.updateConfig({ configPath: '', rootPath: 'public/', config: config })
    for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
      if (Object.keys(config.WoTs)[i] !== config.Instance) {
        let name = Object.keys(config.WoTs)[i]
        let service = config.WoTs[Object.keys(config.WoTs)[i]]
        let serviceSyntax = `${name}._sub`
        for (let j = 0; j < service.protocols.length; j++) {
          serviceSyntax += `._${service.protocols[j]}`
          if (j === service.protocols.length - 1) { serviceSyntax += '.local' }
        }
        listServicewithIns.push(`${config.Instance}.${serviceSyntax}`)
        srv.set(`${config.Instance}.${serviceSyntax}`, JSON.stringify(service.SRV))
        txt.set(`${config.Instance}.${serviceSyntax}`, JSON.stringify(service.TXT))
        listService.push(serviceSyntax)
      }
    }
    this.listServicewithIns = listServicewithIns
    this.listService = listService
    this.srv = srv
    this.txt = txt
  }
  this.listen = function () {
    let bonjour = this
    let config = wtm.getConfig({ configPath: '', rootPath: 'public/' })
    mdns.on('query', function (res, info) {
      let listServicewithIns = bonjour.listServicewithIns
      let listService = bonjour.listService
      let srv = bonjour.srv
      let txt = bonjour.txt
      let promise = new Promise(function (resolve, reject) {
        // const respond = {}
        const answers = []
        const additionals = []
        const QU = res.questions.map(function (element) { return element.QU }).includes(true)
        console.log(color.green(res.questions.map(function (element) { return element.type })))
        console.log(color.green())
        if (res.questions.map((element) => { return element.type }).includes('PTR')) {
          if (res.questions.map(function (element) {
            if (element.type === 'PTR') {
              return element.name
            }
          }).includes('_services._dns-sd._udp.local')) {
            for (let i = 0; i < listService.length; i++) {
              let obj = {}
              obj.name = '_services._dns-sd._udp.local'
              obj.type = 'PTR'
              obj.ttl = 120
              obj.data = config.Instance + '.' + listService[i]
              answers.push(obj)
            }
          } else if (listService.includes(res.questions.map(function (element) {
            if (element.type === 'PTR') {
              return element.name
            }
          }).toString())) {
            let obj = {}
            obj.name = res.questions.map(function (element) {
              if (element.type === 'PTR') {
                return element.name
              }
            }).toString()
            obj.type = 'PTR'
            obj.ttl = 120
            obj.data = config.Instance + '.' + obj.name
            answers.push(obj)
          }
        }
        if (res.questions.map((element) => { return element.type }).includes('SRV')) {
          console.log(res.questions.map(function (element) {
            if (element.type === 'SRV') {
              return element.name
            }
          }))
          if (listServicewithIns.includes(res.questions.map(function (element) {
            if (element.type === 'SRV') {
              return element.name
            }
          }).toString())) {
            let obj = {}
            let serviceSRV = JSON.parse(srv.get(res.questions.map(function (element) {
              if (element.type === 'SRV') {
                return element.name
              }
            }).toString()))
            obj.name = res.questions.map(function (element) {
              if (element.type === 'SRV') {
                return element.name
              }
            }).toString()
            obj.type = 'SRV'
            obj.ttl = 120
            obj.data = {}
            obj.data.port = serviceSRV.port
            obj.data.weight = serviceSRV.weigth
            obj.data.priority = serviceSRV.priority
            obj.data.target = config.A.name
            answers.push(obj)
          }
        }
        if (res.questions.map((element) => { return element.type }).includes('TXT')) {
          if (listServicewithIns.includes(res.questions.map(function (element) {
            if (element.type === 'TXT') {
              return element.name
            }
          }).toString())) {
            let obj = {}
            let serviceTXT = JSON.parse(txt.get(res.questions.map(function (element) {
              if (element.type === 'TXT') {
                return element.name
              }
            }).toString()))
            obj.name = res.questions.map(function (element) {
              if (element.type === 'TXT') {
                return element.name
              }
            }).toString()
            obj.type = 'TXT'
            obj.ttl = 120
            obj.data = []
            for (let i = 0; i < serviceTXT.length; i++) { obj.data.push(Buffer.from(serviceTXT[i], 'ascii')) }
            answers.push(obj)
          }
        }
        if (res.questions.map((element) => { return element.type }).includes('A')) {
          if (res.questions.map(function (element) {
            if (element.type === 'A') {
              return element.name
            }
          }).includes(config.A.name)) {
            let obj = {}
            obj.name = config.A.name
            obj.type = 'A'
            obj.ttl = 120
            obj.data = config.A.data
            obj.flush = true
            answers.push(obj)
          }
        }
        resolve({ answers: answers, additionals: additionals, info: info, QU: QU })
      })
      promise.then(function (full) {
        console.log(full)
        if (full.QU) {
          mdns.respond({ answers: full.answers, additionals: full.additionals }, full.info)
        } else {
          mdns.respond({ answers: full.answers, additionals: full.additionals })
        }
      })
    })
  }
}
exports.bonjour = bonjour
