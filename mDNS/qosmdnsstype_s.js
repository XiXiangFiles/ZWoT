const mDNS = require('../node_modules/zwot-multicast-dns')()
const process = require('process')
const now = require('date-now')
const request = require('../node_modules/request')
const unfi = require('../unifiable')
const fs = require('fs')
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
let answer = {ipv4: [] }
mDNS.on('response', function (packet, rinfo) {
  dnssdQ = []
  const ptr = packet.answers.filter((e) => { if (e.type === 'PTR') { return e } })
  const srv = packet.answers.filter((e) => { if (e.type === 'SRV') { return e } })
  const txt = packet.answers.filter((e) => { if (e.type === 'TXT') { return e } })
  answer.ipv4.push(rinfo.address)
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
  timeup = now()
})
function generateStype(num){
  switch(num){
    case 0: return "_tv._sub._http._tcp.local"
    case 1: return "_tv._sub._websocket._tcp.local"
    case 2: return "_tv._sub._coap._udp.local"
  }
}
console.log({ name: `${generateStype(getRandomIntInclusive(0,2))}`})
dnssdQ.push({ name: `${generateStype(getRandomIntInclusive(0,2))}`, type: 'PTR', QU: true })
//dnssdA.push({ name: '_tv.*.local', type: 'TXT', data: [`exp = ${unfi.decode(`values.size === ${answer.size}`)}`] })

mDNS.query({ questions: dnssdQ, additionals: dnssdA })
setTimeout(function() {
  function record(filename,file){
    try {
      fs.appendFileSync(`${filename}.csv`, `${file}\n`)
    } catch (e) {
      fs.writeFileSync(`${filename}.csv`, `${file}`)
    }
  }	 
  let flag = 0
  console.log(answer)
  answer.ipv4 = JSON.stringify(answer.ipv4)
  if ((timeup ) < now()) {
    request.post({url:'http://172.17.0.1:3000/precisionStype', form:answer}, function(err,httpResponse,body){
      record("mdnsstyperecision",body) 
      console.log(`precision = ${body}`)
      flag++
    })
    request.post({url:'http://172.17.0.1:3000/recallStype',  form:answer}, function(err,httpResponse,body){ 
      record("mdnsstyperecall",body) 
      console.log(`recall = ${body}`)
      process.exit()
      flag++
    })
    if (flag === 2) {
    }
  }
}, 400)
setTimeout(() => {
  if (!timeup) {
    timeup = now()
  }
}, 100)
