const mDNS = require('../node_modules/zwot-multicast-dns')()
const process = require('process')
const pidusage = require('../node_modules/pidusage')
const fs = require('fs')
const color = require('../node_modules/colors')
const filename = process.argv[2]
if (filename) {

} else {
  console.log('please input filename')
  process.exit()
}
let count = 0
async function saveLog () {
  setInterval(function () {
    pidusage(process.pid, function (_err, stats) {
      try {
        fs.appendFileSync(`${filename}.csv`, `${stats.cpu},${stats.memory}\n`)
      } catch (e) {
        fs.writeFileSync(`${filename}.csv`, `${stats.cpu},${stats.memory}`)
      }
    })
  }, 1)
}
let ptrcount = 0
let ptrcompare = 0
let dnssdQ = []
mDNS.on('response', function (packet) {
  dnssdQ = []
  const ptr = packet.answers.filter((e) => { if (e.type === 'PTR') { return e } })
  const srv = packet.answers.filter((e) => { if (e.type === 'SRV') { return e } })
  if (ptr) {
    for (let i = 0; i < ptr.length; i++) {
      if (ptr[i].name === '_services._dns-sd._udp.local') {
        dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false })
        ptrcount++
      } else {
        dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false })
        dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'TXT', QU: false })
        ptrcount++
      }
    }
  }
  if (srv) {
    for (let i = 0; i < srv.length; i++) {
      dnssdQ.push({ name: srv[i].data.target, type: 'A', QU: false })
    }
  }
  if (dnssdQ.length > 0) {
    mDNS.query(dnssdQ)
    ptrcompare += ptr.length
    console.log(color.red(ptrcount))
    console.log(color.red(ptrcompare))
    if (ptrcount === ptrcompare) {
      console.log(dnssdQ)
      mDNS.query(dnssdQ)
      ptrcount = 0
      ptrcompare = 0
      console.log(count)
      if (count++ === 15) {
        setTimeout(() => { process.exit() }, 1000)
      }
    }
  }
})
dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: false })
mDNS.query(dnssdQ)
saveLog()
