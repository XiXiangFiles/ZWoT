const test = require('tape')
const app = require('./app.js')
const mDNS = require('zwot-multicast-dns')()
const ip = require('ip')

test('mDNS PTR Once Query TEST(QM)', function (t) {
  const dnssdQ = []
  const dnssdAns = []

  dnssdQ.push({ name: app.dnssd.allService[0], type: 'PTR' })
  dnssdAns.push(app.dnssd.allServiceIns[0])
  mDNS.once('response', function (packet) {
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'PTR', data: dnssdAns[0] })
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS SRV Once Query TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.allServiceIns[0], type: 'SRV' })
  mDNS.once('response', function (packet) {
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(dnssdQ[0].name)) })
    t.end()
  })
  mDNS.query(dnssdQ)
})

test('mDNS TXT Once Query TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.allServiceIns[0], type: 'TXT' })
  mDNS.once('response', function (packet) {
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data.map((txts) => { return txts.toString('utf8') }) }, { name: dnssdQ[0].name, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(dnssdQ[0].name)) })
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS A Once Query TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A' })
  mDNS.once('response', function (packet) {
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data })
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR Once Query TEST(QU)', function (t) {
  const dnssdQ = []
  const dnssdAns = []

  dnssdQ.push({ name: app.dnssd.allService[0], type: 'PTR', QU: true })
  dnssdAns.push(app.dnssd.allServiceIns[0])
  mDNS.once('response', function (packet) {
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'PTR', data: dnssdAns[0] })
    t.end()
  })
  mDNS.query(dnssdQ)
})
test.onFinish(() => {
  app.destroy()
})
