const mdns = require('../node_modules/zwot-multicast-dns')()
let queryque = new Set()
mdns.on('response', function (res) {
  console.log(res.answers)
  let promise = new Promise(function (resolve, reject) {
    let arr = []
    if (res.answers.map(function (answer) { return answer.type }).includes('SRV')) {
      for (let i = 0; i < res.answers.length; i++) {
        if (res.answers[i].type === 'SRV' && queryque.has(res.answers[i].name)) {
          mdns.query([{ name: res.answers[i].data.target, type: 'A' }])
          console.log({ name: res.answers[i].data.target, type: 'A' })
          queryque.delete(res.answers[i].name)
        }
      }
    }
    if (res.answers.map(function (answer) { return answer.type }).includes('PTR')) {
      for (let i = 0; i < res.answers.length; i++) {
        if (res.answers[i].type === 'PTR') {
          arr.push(res.answers[i].data)
          arr.push('PTR')
          arr.push('SRV')
          arr.push('TXT')
          arr.push('A')
          resolve(arr)
        }
      }
    }
  })
  promise.then(function (full) {
    let name = full[0]
    for (let i = 1; i < full.length; i++) {
      if (full[i] === 'SRV') {
        queryque.add(name)
        console.log({ name: name, type: 'SRV' })
        mdns.query([{ name: name, type: 'SRV' }])
      }
      if (full[i] === 'TXT') {
        mdns.query([{ name: name, type: 'TXT' }])
        console.log({ name: name, type: 'TXT' })
      }
    }
  })
})
mdns.query([{ name: '_temperature._sub._http._websocket._tcp.local', type: 'PTR', QU: true }])
mdns.respond({ answers: [{ name: 'percomTest._transfer._sub._ssh._tcp.local', type: 'SRV', ttl: 120, data: JSON.parse('{"priority":0,"weight":0,"port":22,"target":"percomTest.local"}') }] })
