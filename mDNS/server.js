const mdns = require('../node_modules/zwot-multicast-dns')()
const color = require('../node_modules/colors')
const events = require('../node_modules/events')
const expr = require('../node_modules/expression-eval')
const wtm = require('../wtm')
const unifiable = require('../unifiable')
const now = require('date-now')

function Bonjour () {
  events.EventEmitter.call(this)
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
        service.TXT.push(`port=${service.SRV.port}`)
        service.TXT.push(`ipv4=${config.A.data}`)
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
    return { allService: listService, allServiceIns: listServicewithIns, srv: srv, txt: txt, a: config.A }
  }
  this.probe = function () {
    let flag = 0
    const start = now()
    async function probe () {
      function probe () {
        return new Promise(function (resolve) {
          const config = wtm.getConfig({ configPath: '', rootPath: 'public/' })
          const t1 = now()
          mdns.once('response', function (res, info) {
            const t2 = now()
            if (t2 - t1 < 12000) {
              const ans = res.answers
              for (let i = 0; i < res.answers.length; i++) {
                if (ans[i].type === 'A' && ans[i].name === config.A.name) {
                  const time = now()
                  const temp = config.Instance
                  config.Instance = config.Instance + time
                  config.A.name = `${config.Instance}.local`
                  for (let j = 0; j < Object.keys(config.WoTs).length; j++) {
                    if (Object.keys(config.WoTs)[j] === temp) {
                      config.WoTs[config.Instance] = config.WoTs[Object.keys(config.WoTs)[j]]
                      delete config.WoTs[Object.keys(config.WoTs)[j]]
                    }
                    try {
                      config.WoTs[Object.keys(config.WoTs)[j]].SRV.target = config.A.name
                    } catch (e) {}
                  }
                  wtm.updateConfig({ configPath: '', config: config })
                  resolve(true)
                }
              }
            }
          })
          while (true) {
            if (now() - t1 > 2000) {
              resolve(false)
              break
            }
          }
          mdns.query([{ name: config.A.name, type: 'ANY' }])
          mdns.query([{ name: config.A.name, type: 'ANY' }])
          mdns.query([{ name: config.A.name, type: 'ANY' }])
        })
      }
      probe().then(function (full) {
        if (full === false) {
          flag++
        } else {
          flag--
        }
      })
    }
    while (flag < 3 && now() - start < 100000) {
      if (flag < 3) {
        if (probe()) {
          flag++
        } else {
          if (flag > 0) {
            flag--
          }
        }
      }
    }
    return true
  }

  this.listen = function () {
    let bonjour = this
    mdns.on('query', function (res, info) {
      let config = wtm.getConfig({ configPath: '', rootPath: 'public/' })
      let listServicewithIns = bonjour.listServicewithIns
      let listService = bonjour.listService
      let srv = bonjour.srv
      let txt = bonjour.txt
      let promise = new Promise(function (resolve, reject) {
        const answers = []
        const additionals = []
        const QU = res.questions.map(function (element) { return element.QU }).includes(true)
        if (res.questions.map((element) => { return element.type }).includes('PTR')) {
          if (res.questions.map(function (element) {
            if (element.type === 'PTR') { return element.name }
          }).includes('_services._dns-sd._udp.local')) {
            for (let i = 0; i < listService.length; i++) {
              let packet = {}
              packet.name = '_services._dns-sd._udp.local'
              packet.type = 'PTR'
              packet.ttl = 120
              packet.data = listService[i]
              answers.push(packet)
            }
          } else {
            let ptr = res.questions.map(function (element) {
              if (element.type === 'PTR') {
                return element.name
              }
            }).toString().split(',')

            for (let i = 0; i < ptr.length; i++) {
              if (listService.includes(ptr[i])) {
                const packet = {}
                packet.name = ptr[i]
                packet.type = 'PTR'
                packet.ttl = 120
                packet.data = config.Instance + '.' + ptr[i]
                answers.push(packet)
              }
            }
          }
        }
        if (res.questions.map((element) => { return element.type }).includes('SRV')) {
          let name = res.questions.map(function (element) { if (element.type === 'SRV') { return element.name } }).toString().split(',')
          for (let i = 0; i < name.length; i++) {
            if (listServicewithIns.includes(name[i])) {
              const packet = {}
              packet.name = name[i]
              packet.type = 'SRV'
              packet.ttl = 120
              packet.data = JSON.parse(srv.get(name[i]))
              answers.push(packet)
            }
          }
        }
        if (res.questions.map((element) => { return element.type }).includes('TXT')) {
          let name = res.questions.map(function (element) { if (element.type === 'TXT') { return element.name } }).toString().split(',')
          for (let i = 0; i < name.length; i++) {
            if (listServicewithIns.includes(name[i])) {
              const packet = {}
              packet.name = name[i]
              packet.type = 'TXT'
              packet.ttl = 120
              packet.data = []
              for (let j = 0; j < JSON.parse(txt.get(name[i])).length; j++) {
                packet.data.push(Buffer.from(JSON.parse(txt.get(name[i]))[j], 'ascii'))
              }
              answers.push(packet)
            }
          }
        }
        if (res.questions.map((element) => { return element.type }).includes('A')) {
          let name = res.questions.map(function (element) { if (element.type === 'A') { return element.name } }).toString().split(',')
          for (let i = 0; i < name.length; i++) {
            if (name[i] === config.A.name) {
              const packet = {}
              packet.name = name[i]
              packet.type = 'A'
              packet.ttl = 120
              packet.data = config.A.data
              answers.push(packet)
            }
          }
        }

        if (res.questions.map((element) => { return element.type }).includes('ANY')) {
          let name = res.questions.map(function (element) { if (element.type === 'ANY') { return element.name } }).toString().split(',')
          for (let i = 0; i < name.length; i++) {
            const packet = {}
            packet.name = name[i]
            packet.type = 'A'
            packet.ttl = 120
            packet.data = config.A.data
            if (name[i] === config.A.name) {
              answers.push(packet)
            }
          }
        }
        const queryAdditionals = res.additionals.filter((additional) => { return additional.type === 'TXT' })
        if (queryAdditionals) {
          try {
            const ans = new Set()
            for (let z = 0; z < queryAdditionals.length; z++) {
              const star = queryAdditionals[z].name.split('*')
              const ansFilter = answers.filter((ans) => {
                let expect = 0
                let actual = 0
                if (ans.type === 'PTR') {
                  for (let i = 0; i < star.length; i++) {
                    let compareStart = star[i].split('.').filter((str) => { return str !== '' })
                    expect += compareStart.length
                    for (let j = 0; j < ans.data.split('.').length; j++) {
                      for (let k = 0; k < compareStart.length; k++) {
                        if (compareStart[k] === ans.data.split('.')[j]) {
                          actual++
                        }
                      }
                    }
                  }
                }
                return expect === actual
              })
              const ansFilterlength = ansFilter.length
              res.additionals[z].data = res.additionals[z].data.map((e) => { return e.toString('utf8').replace('exp =', '') })
              for (let x = 0; x < res.additionals[z].data.length; x++) {
                const flag = unifiable.parseValue(unifiable.encode(res.additionals[z].data[x]), config.WoTs).filter((wot) => {
                  return expr.eval(expr.parse(wot))
                })
                let expansnum = []
                let parseValue = unifiable.parseValue(unifiable.encode(res.additionals[z].data[x]), config.WoTs)
                for (let g = 0; g < parseValue.length; g++) {
                  for (let g1 = 0; g1 < flag.length; g1++) {
                    if (parseValue[g] === flag[g1]) {
                      if (!expansnum.includes(g)) {
                        expansnum.push(g)
                      }
                    }
                  }
                }
                for (let i = 0; i < ansFilterlength; i++) {
                  if (flag && res.additionals[z].data[x].length > 0) {
                    for (let v = 0; v < expansnum.length; v++) {
                      if (listServicewithIns[expansnum[v]] === config.Instance + '.' + ansFilter[i].data) {
                        ansFilter.push({ name: config.Instance + '.' + ansFilter[i].data, type: 'TXT', ttl: 120, data: JSON.parse(txt.get(config.Instance + '.' + ansFilter[i].data)) })
                        expansnum[v] = -1
                      } else if (listService[expansnum[v]] === ansFilter[i].data) {
                        ansFilter.push({ name: listServicewithIns[expansnum[v]], type: 'TXT', ttl: 120, data: JSON.parse(txt.get(listServicewithIns[expansnum[v]])) })
                        expansnum[v] = -1
                      }
                    }
                  } else {
                    if (txt.get(ansFilter[i].data)) {
                      ansFilter.push({ name: ansFilter[i].data, type: 'TXT', ttl: 120, data: JSON.parse(txt.get(ansFilter[i].data)) })
                    } else if (txt.get(`${config.Instance}.${ansFilter[i].data}`)) {
                      ansFilter.push({ name: `${config.Instance}.${ansFilter[i].data}`, type: 'TXT', ttl: 120, data: JSON.parse(txt.get(`${config.Instance}.${ansFilter[i].data}`)) })
                    }
                  }
                }
              }
              for (let h = 0; h < ansFilter.length; h++) {
                ans.add(JSON.stringify(ansFilter[h]))
              }
              if (queryAdditionals.length - 1 === z) {
                const temp = []
                let correctAns = []
                const sendAns = ans.values()
                for (let g = 0; g < ans.size; g++) {
                  temp.push(JSON.parse(sendAns.next().value))
                }
                correctAns = temp.filter((e) => { if (e.type === 'PTR') { return temp.map((a) => { if (a.type === 'TXT') return a.name }).includes(e.data) || temp.map((a) => { if (a.type === 'TXT') return a.name }).includes(`${config.Instance}.${e.data}`) } }).concat(correctAns.concat(temp.filter((e) => { if (e.type === 'TXT') { return e } })))
                correctAns.concat(temp.filter((e) => { if (e.type === 'TXT') { return e } }))
                resolve({ answers: correctAns, additionals: additionals, info: info, QU: QU, bonjour: this })
              }
            }
          } catch (err) {
            console.error(color.red(err))
          }
        }
        resolve({ answers: answers, additionals: additionals, info: info, QU: QU, bonjour: this })
      })
      promise.then(function (full) {
        if (full.QU) {
          if (full.answers.length > 0) {
            console.log({ answers: full.answers, additionals: full.additionals })
            mdns.respond({ answers: full.answers, additionals: full.additionals }, full.info)
            bonjour.emit('QU', true)
          }
        } else {
          if (full.answers.length > 0) {
            bonjour.emit('QU', false)
            mdns.respond({ answers: full.answers, additionals: full.additionals })
          }
        }
      })
    })
  }
}
// eslint-disable-next-line no-proto
Bonjour.prototype.__proto__ = events.EventEmitter.prototype
module.exports = new Bonjour()