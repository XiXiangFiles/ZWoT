const mDNS = require('../node_modules/zwot-multicast-dns')()
const process = require('process')
const now = require('date-now')
const request = require('../node_modules/request')
const unfi = require('../unifiable')
const filename = process.argv[2]

function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
let dnssdQ = []
let dnssdA = []
let timeup
const set = new Set()
let answer = { size: getRandomIntInclusive(50, 20), ipv4: [] }
mDNS.on('response', function (packet) {
  dnssdQ = []
  const ptr = packet.answers.filter((e) => { if (e.type === 'PTR') { return e } })
  const srv = packet.answers.filter((e) => { if (e.type === 'SRV') { return e } })
  const txt = packet.answers.filter((e) => { if (e.type === 'TXT') { return e } })
  if (txt.length > 0) {
    txt.filter((e) => { return e.name })
  }
  if (ptr) {
    for (let i = 0; i < ptr.length; i++) {
      if (ptr[i].name === '_services._dns-sd._udp.local') {
        if (!set.has(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false }))) {
          set.add(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false }))
        //   dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false })
        }
      } else {
        if (!set.has(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false }))) {
          set.add(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false }))
        //   dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false })
        }
        if (!set.has(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'TXT', QU: false }))) {
          set.add(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'TXT', QU: false }))
        //   dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'TXT', QU: false })
        }
      }
    }
  }
  if (srv) {
    for (let i = 0; i < srv.length; i++) {
      if (!set.has(JSON.stringify({ name: srv[i].data.target, type: 'A', QU: false }))) {
        set.add(JSON.stringify({ name: srv[i].data.target, type: 'A', QU: false }))
        // dnssdQ.push({ name: srv[i].data.target, type: 'A', QU: false })
      }
    }
  }
  if (dnssdQ.length > 0) {
    mDNS.query(dnssdQ)
  }
  try {
    let ipv4, port, url
    for (let i = 0; i < txt[0].data.length; i++) {
      let value = txt[0].data[i].toString('utf8')
      if (value.includes('ipv4=')) { ipv4 = value.split('ipv4=')[1] }
      if (value.includes('port=')) { port = value.split('port=')[1] }
      if (value.includes('url=')) { url = value.split('url=')[1] }
      if (ipv4) {
        answer.ipv4.push(ipv4)
      }
    }
    request(`http://${ipv4}:${port}/model`, function (_error, response, body) {
    })
  } catch (_err) {
  }
  timeup = now()
})

dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
dnssdA.push({ name: '*.local', type: 'TXT', data: [`exp = ${unfi.decode(`values.size === ${answer.size}`)}`] })

mDNS.query({ questions: dnssdQ, additionals: dnssdA })
setInterval(() => {
  if ((timeup + 500) < now()) {
    console.log(JSON.stringify(answer))
    process.exit()
  }
}, 400)
setTimeout(() => {
  if (!timeup) {
    timeup = now()
  }
}, 500)
