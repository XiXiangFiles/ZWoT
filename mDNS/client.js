const mDNS = require('../node_modules/zwot-multicast-dns')()
const process = require('process')
const pidusage = require('../node_modules/pidusage')
const fs = require('fs')
const color = require('../node_modules/colors')
const now = require('date-now')
const filename = process.argv[2]
if (filename) {

} else {
  console.log('please input filename')
  process.exit()
}
async function saveLog () {
  pidusage(process.pid, function (_err, stats) {
    try {
      console.log(`${filename}.csv`, `${stats.cpu},${stats.memory}\n`)
      fs.appendFileSync(`${filename}.csv`, `${stats.cpu},${stats.memory}\n`)
    } catch (e) {
      fs.writeFileSync(`${filename}.csv`, `${stats.cpu},${stats.memory}`)
      console.log(`${filename}.csv`, `${stats.cpu},${stats.memory}\n`)
    }
  })
  setTimeout(() => {}, 100)
}
let dnssdQ = []
let timeup
const set = new Set()

mDNS.on('response', function (packet) {
  dnssdQ = []
  const ptr = packet.answers.filter((e) => { if (e.type === 'PTR') { return e } })
  const srv = packet.answers.filter((e) => { if (e.type === 'SRV') { return e } })
  if (ptr) {
    for (let i = 0; i < ptr.length; i++) {
      if (ptr[i].name === '_services._dns-sd._udp.local') {
        if (!set.has(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false }))) {
          set.add(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false }))
          dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'PTR', QU: false })
        }
      } else {
        if (!set.has(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false }))) {
          set.add(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false }))
          dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false })
        }
        if (!set.has(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'TXT', QU: false }))) {
          set.add(JSON.stringify({ name: ptr[i].data.toString('utf8'), type: 'TXT', QU: false }))
          dnssdQ.push({ name: ptr[i].data.toString('utf8'), type: 'SRV', QU: false })
        }
      }
    }
  }
  if (srv) {
    for (let i = 0; i < srv.length; i++) {
      if (!set.has(JSON.stringify({ name: srv[i].data.target, type: 'A', QU: false }))) {
        set.add(JSON.stringify({ name: srv[i].data.target, type: 'A', QU: false }))
        dnssdQ.push({ name: srv[i].data.target, type: 'A', QU: false })
      }
    }
  }
  if (dnssdQ.length > 0) {
    mDNS.query(dnssdQ)
    console.log(dnssdQ)
  }
  saveLog()
  timeup = now()
})
saveLog()
dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: false })
mDNS.query(dnssdQ)
setInterval(() => { if ((timeup + 500) < now()) { process.exit() } }, 100)
