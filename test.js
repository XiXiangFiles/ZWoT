const test = require('tape')
const app = require('./app.js')
const mDNS = require('zwot-multicast-dns')()
const color = require('colors')

test('DNS-SD SRV', function (t) {
  app.dnssd.srv.forEach((val) => {
    val = JSON.parse(val)
    function srvkey (val) {
      return Object.keys(val).includes('priority') || Object.keys(val).includes('weight') || Object.keys(val).includes('port') || Object.keys(val).includes('target') || true
    }
    t.equal(srvkey(val), true, 'SRV Key TEST')
    t.equal(val.target, app.dnssd.a.name, 'SRV target TEST')
  })
  t.end()
})
test('DNS-SD TXT', function (t) {
  app.dnssd.txt.forEach((val, key) => {
    val = JSON.parse(val)
    for (let i = 0; i < val.length; i++) {
      let split = val[i].split('=')
      switch (split[0]) {
        case 'ipv4':
          t.equal(split[1], app.dnssd.a.data, 'IPv4 Address TEST')
          break
        case 'url':
          t.equal(split[1].split(',').length, 2, 'URL length TEST')
          break
        case 'port':
          t.equal(split[1], `${JSON.parse(app.dnssd.srv.get(key)).port}`, 'Port TEST')
          break
      }
    }
  })
  t.end()
})
test('mDNS PTR one question TEST(QM)', function (t) {
  const dnssdQ = []
  const dnssdAns = []

  dnssdQ.push({ name: app.dnssd.allService[0], type: 'PTR' })
  dnssdAns.push(app.dnssd.allServiceIns[0])
  mDNS.once('response', function (packet) {
    t.equal(app.QU, false, 'QM TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'PTR', data: dnssdAns[0] }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS SRV one question TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.allServiceIns[0], type: 'SRV' })
  mDNS.once('response', function (packet) {
    t.equal(app.QU, false, 'QM TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(dnssdQ[0].name)) }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})

test('mDNS TXT one question TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.allServiceIns[0], type: 'TXT' })
  mDNS.once('response', function (packet) {
    t.equal(app.QU, false, 'QM TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data.map((txts) => { return txts.toString('utf8') }) }, { name: dnssdQ[0].name, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(dnssdQ[0].name)) }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS A one question TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A' })
  mDNS.once('response', function (packet) {
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR one question TEST(QU)', function (t) {
  const dnssdQ = []
  const dnssdAns = []

  dnssdQ.push({ name: app.dnssd.allService[0], type: 'PTR', QU: true })
  dnssdAns.push(app.dnssd.allServiceIns[0])
  mDNS.once('response', function (packet, rinfo) {
    t.equal(app.QU, true, 'QU TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'PTR', data: dnssdAns[0] }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS SRV one question TEST(QU)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.allServiceIns[0], type: 'SRV', QU: true })
  mDNS.once('response', function (packet, rinfo) {
    t.equal(app.QU, true, 'QU TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(dnssdQ[0].name)) }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS TXT one question TEST(QU)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.allServiceIns[0], type: 'TXT', QU: true })
  mDNS.once('response', function (packet, rinfo) {
    t.equal(app.QU, true, 'QU TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data.map((txts) => { return txts.toString('utf8') }) }, { name: dnssdQ[0].name, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(dnssdQ[0].name)) }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS A one question TEST(QU)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A', QU: true })
  mDNS.once('response', function (packet, rinfo) {
    t.equal(app.QU, true, 'QU TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR multiple questions TEST(QM)', function (t) {
  const dnssdQ = []
  const dnssdAns = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    dnssdQ.push({ name: allService[i], type: 'PTR' })
    dnssdAns.push(app.dnssd.allServiceIns[i])
  }
  mDNS.once('response', function (packet) {
    for (let i = 0; i < dnssdAns.length; i++) {
      t.equal(app.QU, false, 'QM TEST')
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data }, { name: dnssdQ[i].name, type: 'PTR', data: dnssdAns[i] }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS SRV multiple questions TEST(QM)', function (t) {
  const dnssdQ = []
  const dnssdAns = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    dnssdQ.push({ name: app.dnssd.allServiceIns[i], type: 'SRV' })
    dnssdAns.push(app.dnssd.allServiceIns[i])
  }
  mDNS.once('response', function (packet) {
    for (let i = 0; i < dnssdAns.length; i++) {
      t.equal(app.QU, false, 'QM TEST')
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data }, { name: dnssdQ[i].name, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(dnssdQ[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS TXT multiple questions TEST(QM)', function (t) {
  const dnssdQ = []
  const dnssdAns = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    t.equal(app.QU, false, 'QM TEST')
    dnssdQ.push({ name: app.dnssd.allServiceIns[i], type: 'TXT' })
    dnssdAns.push(app.dnssd.allServiceIns[i])
  }
  mDNS.once('response', function (packet) {
    for (let i = 0; i < dnssdAns.length; i++) {
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: dnssdQ[i].name, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(dnssdQ[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS A multiple questions TEST(QM)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A' })
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A' })
  mDNS.once('response', function (packet, rinfo) {
    t.equal(app.QU, false, 'QU TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
    t.same({ name: packet.answers[1].name, type: packet.answers[0].type, data: packet.answers[1].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR multiple questions TEST(QU)', function (t) {
  const dnssdQ = []
  const dnssdAns = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    dnssdQ.push({ name: allService[i], type: 'PTR', QU: true })
    dnssdAns.push(app.dnssd.allServiceIns[i])
  }
  mDNS.once('response', function (packet) {
    for (let i = 0; i < dnssdAns.length; i++) {
      t.equal(app.QU, true, 'QU TEST')
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data }, { name: dnssdQ[i].name, type: 'PTR', data: dnssdAns[i] }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS SRV multiple questions TEST(QU)', function (t) {
  const dnssdQ = []
  const dnssdAns = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    dnssdQ.push({ name: app.dnssd.allServiceIns[i], type: 'SRV', QU: true })
    dnssdAns.push(app.dnssd.allServiceIns[i])
  }
  mDNS.once('response', function (packet) {
    for (let i = 0; i < dnssdAns.length; i++) {
      t.equal(app.QU, true, 'QU TEST')
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data }, { name: dnssdQ[i].name, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(dnssdQ[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS TXT multiple questions TEST(QU)', function (t) {
  const dnssdQ = []
  const dnssdAns = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    dnssdQ.push({ name: app.dnssd.allServiceIns[i], type: 'TXT', QU: true })
    dnssdAns.push(app.dnssd.allServiceIns[i])
  }
  mDNS.once('response', function (packet) {
    for (let i = 0; i < dnssdAns.length; i++) {
      t.equal(app.QU, true, 'QU test')
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: dnssdQ[i].name, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(dnssdQ[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS A multiple questions TEST(QU)', function (t) {
  const dnssdQ = []
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A', QU: true })
  dnssdQ.push({ name: app.dnssd.a.name, type: 'A', QU: true })
  mDNS.once('response', function (packet, rinfo) {
    t.equal(app.QU, true, 'QU TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
    t.same({ name: packet.answers[1].name, type: packet.answers[0].type, data: packet.answers[1].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
    t.end()
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR Service-Discovery TEST(QM)', function (t) {
  const dnssdQ = []
  const dnssdAns = []

  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR' })
  dnssdAns.push(app.dnssd.allServiceIns[0])
  mDNS.once('response', function (packet) {
    t.equal(app.QU, false, 'QM TEST')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'PTR', data: dnssdAns[0] }, 'Packet TEST')
    mDNS.once('response', function (packet2) {
      t.same({ name: packet.answers[0].data, type: packet2.answers[0].type, data: packet2.answers[0].data }, { name: packet.answers[0].data, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(packet.answers[0].data)) }, 'Packet TEST')
      t.same({ name: packet.answers[0].data, type: packet2.answers[1].type, data: packet2.answers[1].data.map((txts) => { return txts.toString('utf8') }) }, { name: packet.answers[0].data, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(packet.answers[0].data)) }, 'Packet TEST')
      mDNS.once('response', function (packet3) {
        t.same({ name: packet3.answers[0].name, type: packet3.answers[0].type, data: packet3.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
        t.end()
      })
      mDNS.query([{ name: JSON.parse(app.dnssd.srv.get(packet.answers[0].data)).target, type: 'A' }])
    })
    mDNS.query([{ name: packet.answers[0].data, type: 'SRV' }, { name: packet.answers[0].data, type: 'TXT' }])
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR Service-Discovery TEST(QU)', function (t) {
  const dnssdQ = []
  const dnssdAns = []

  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdAns.push(app.dnssd.allServiceIns[0])
  mDNS.once('response', function (packet) {
    t.equal(app.QU, true, 'QU test')
    t.same({ name: packet.answers[0].name, type: packet.answers[0].type, data: packet.answers[0].data }, { name: dnssdQ[0].name, type: 'PTR', data: dnssdAns[0] }, 'Packet TEST')
    mDNS.once('response', function (packet2) {
      t.equal(app.QU, true, 'QU test')
      t.same({ name: packet.answers[0].data, type: packet2.answers[0].type, data: packet2.answers[0].data }, { name: packet.answers[0].data, type: 'SRV', data: JSON.parse(app.dnssd.srv.get(packet.answers[0].data)) }, 'Packet TEST')
      t.same({ name: packet.answers[0].data, type: packet2.answers[1].type, data: packet2.answers[1].data.map((txts) => { return txts.toString('utf8') }) }, { name: packet.answers[0].data, type: 'TXT', data: JSON.parse(app.dnssd.txt.get(packet.answers[0].data)) }, 'Packet TEST')
      mDNS.once('response', function (packet3) {
        t.equal(app.QU, true, 'QU test')
        t.same({ name: packet3.answers[0].name, type: packet3.answers[0].type, data: packet3.answers[0].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
        t.end()
      })
      mDNS.query([{ name: JSON.parse(app.dnssd.srv.get(packet.answers[0].data)).target, type: 'A', QU: true }])
    })
    mDNS.query([{ name: packet.answers[0].data, type: 'SRV', QU: true }, { name: packet.answers[0].data, type: 'TXT' }])
  })
  mDNS.query(dnssdQ)
})
test('mDNS PTR Multiple Service-Discovery TEST(QU)', function (t) {
  let dnssdQ = []

  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: false })
  mDNS.once('response', function (packet) {
    t.equal(app.QU, false, 'QM test')
    for (let i = 0; i < packet.answers.length; i++) {
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns[i] }, '_services._dns-sd._udp.local TEST')
      dnssdQ.push({ name: packet.answers[i].data, type: 'SRV', QU: false })
      dnssdQ.push({ name: packet.answers[i].data, type: 'TXT', QU: false })
    }
    mDNS.once('response', function (packet2) {
      dnssdQ = []
      for (let i = 0; i < packet2.answers.length; i++) {
        if (packet2.answers[i].type === 'SRV') {
          t.equal(app.dnssd.allServiceIns.includes(packet2.answers[i].name), true, 'SRV Name TEST')
          t.same(packet2.answers[i].data, JSON.parse(app.dnssd.srv.get(packet2.answers[i].name)), 'SRV Data TEST')
          dnssdQ.push({ name: packet2.answers[i].data.target, type: 'A', QU: false })
        }
        if (packet2.answers[i].type === 'TXT') {
          t.equal(app.dnssd.allServiceIns.includes(packet2.answers[i].name), true, 'TXT Name TEST')
          t.same(packet2.answers[i].data.map((txts) => { return txts.toString('utf8') }), JSON.parse(app.dnssd.txt.get(packet2.answers[i].name)), 'TXT Data TEST')
        }
      }
      mDNS.once('response', function (packet3) {
        for (let i = 0; i < packet3.answers.length; i++) {
          t.same({ name: packet3.answers[i].name, type: packet3.answers[i].type, data: packet3.answers[i].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
        }
        t.end()
      })
      mDNS.query(dnssdQ)
    })
    mDNS.query(dnssdQ)
  })
  mDNS.query(dnssdQ)
})
test('ZWOT PTR Search (_services._dns-sd._udp.local) TEST (name: "*.local" No Expressions)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdA.push({ name: '*.local', type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    let discoveryPTR = packet.answers.filter(function (ans) {
      return ans.type === 'PTR'
    })
    let discoveryTXT = packet.answers.filter(function (ans) {
      return ans.type === 'TXT'
    })
    t.equal(packet.answers.length, app.dnssd.allServiceIns.length * 2, 'Packet Answers Length TEST')
    for (let i = 0; i < discoveryPTR.length; i++) {
      t.same({ name: discoveryPTR[i].name, type: discoveryPTR[i].type, data: true }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns.includes(discoveryPTR[i].data) }, 'Packet TEST')
    }
    for (let i = 0; i < discoveryTXT.length; i++) {
      t.same({ name: true, type: discoveryTXT[i].type, data: discoveryTXT[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: app.dnssd.allServiceIns.includes(discoveryTXT[i].name), type: 'TXT', data: JSON.parse(app.dnssd.txt.get(discoveryTXT[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test('ZWOT PTR Search (_services._dns-sd._udp.local) TEST (name: "*.error" No Expressions)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdA.push({ name: '*.error', type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    t.equal(packet.answers.length, 0, 'Packet Answers Length TEST')
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test('ZWOT PTR Search (_services._dns-sd._udp.local) TEST (name: "_sub.*.local" No Expressions)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdA.push({ name: '_sub.*.local', type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    let discoveryPTR = packet.answers.filter(function (ans) {
      return ans.type === 'PTR'
    })
    let discoveryTXT = packet.answers.filter(function (ans) {
      return ans.type === 'TXT'
    })
    t.equal(packet.answers.length, app.dnssd.allServiceIns.length * 2, 'Packet Answers Length TEST')
    for (let i = 0; i < discoveryPTR.length; i++) {
      t.same({ name: discoveryPTR[i].name, type: discoveryPTR[i].type, data: true }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns.includes(discoveryPTR[i].data) }, 'Packet TEST')
    }
    for (let i = 0; i < discoveryTXT.length; i++) {
      t.same({ name: true, type: discoveryTXT[i].type, data: discoveryTXT[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: app.dnssd.allServiceIns.includes(discoveryTXT[i].name), type: 'TXT', data: JSON.parse(app.dnssd.txt.get(discoveryTXT[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test('ZWOT PTR Search (_services._dns-sd._udp.local) TEST (name: "_sub.*._tcp.local" No Expressions)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdA.push({ name: '_sub.*._tcp.local', type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    let discoveryPTR = packet.answers.filter(function (ans) {
      return ans.type === 'PTR'
    })
    let discoveryTXT = packet.answers.filter(function (ans) {
      return ans.type === 'TXT'
    })
    const star = dnssdA[0].name.split('*')
    const test = app.dnssd.allServiceIns.filter((ans) => {
      let expect = 0
      let actual = 0
      for (let i = 0; i < star.length; i++) {
        let compareStart = star[i].split('.').filter((str) => { return str !== '' })
        expect += compareStart.length
        for (let j = 0; j < ans.split('.').length; j++) {
          for (let k = 0; k < compareStart.length; k++) {
            if (compareStart[k] === ans.split('.')[j]) {
              actual++
            }
          }
        }
      }
      return expect === actual
    })
    t.equal(packet.answers.length, test.length * 2, 'Packet Answers Length TEST')
    for (let i = 0; i < discoveryPTR.length; i++) {
      t.same({ name: discoveryPTR[i].name, type: discoveryPTR[i].type, data: true }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns.includes(discoveryPTR[i].data) }, 'Packet TEST')
    }
    for (let i = 0; i < discoveryTXT.length; i++) {
      t.same({ name: true, type: discoveryTXT[i].type, data: discoveryTXT[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: app.dnssd.allServiceIns.includes(discoveryTXT[i].name), type: 'TXT', data: JSON.parse(app.dnssd.txt.get(discoveryTXT[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test('ZWOT PTR Search (_services._dns-sd._udp.local) TEST (name: "_sub.*._udp.local" No Expressions)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdA.push({ name: '_sub.*._udp.local', type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    let discoveryPTR = packet.answers.filter(function (ans) {
      return ans.type === 'PTR'
    })
    let discoveryTXT = packet.answers.filter(function (ans) {
      return ans.type === 'TXT'
    })
    const star = dnssdA[0].name.split('*')
    const test = app.dnssd.allServiceIns.filter((ans) => {
      let expect = 0
      let actual = 0
      for (let i = 0; i < star.length; i++) {
        let compareStart = star[i].split('.').filter((str) => { return str !== '' })
        expect += compareStart.length
        for (let j = 0; j < ans.split('.').length; j++) {
          for (let k = 0; k < compareStart.length; k++) {
            if (compareStart[k] === ans.split('.')[j]) {
              actual++
            }
          }
        }
      }
      return expect === actual
    })
    t.equal(packet.answers.length, test.length * 2, 'Packet Answers Length TEST')
    for (let i = 0; i < discoveryPTR.length; i++) {
      t.same({ name: discoveryPTR[i].name, type: discoveryPTR[i].type, data: true }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns.includes(discoveryPTR[i].data) }, 'Packet TEST')
    }
    for (let i = 0; i < discoveryTXT.length; i++) {
      t.same({ name: true, type: discoveryTXT[i].type, data: discoveryTXT[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: app.dnssd.allServiceIns.includes(discoveryTXT[i].name), type: 'TXT', data: JSON.parse(app.dnssd.txt.get(discoveryTXT[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test('ZWOT PTR Search (_services._dns-sd._udp.local) TEST (name: "_sub.*._websocket.*.local" No Expressions)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  dnssdQ.push({ name: '_services._dns-sd._udp.local', type: 'PTR', QU: true })
  dnssdA.push({ name: '_sub.*._websocket.*.local', type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    let discoveryPTR = packet.answers.filter(function (ans) {
      return ans.type === 'PTR'
    })
    let discoveryTXT = packet.answers.filter(function (ans) {
      return ans.type === 'TXT'
    })
    const star = dnssdA[0].name.split('*')
    const test = app.dnssd.allServiceIns.filter((ans) => {
      let expect = 0
      let actual = 0
      for (let i = 0; i < star.length; i++) {
        let compareStart = star[i].split('.').filter((str) => { return str !== '' })
        expect += compareStart.length
        for (let j = 0; j < ans.split('.').length; j++) {
          for (let k = 0; k < compareStart.length; k++) {
            if (compareStart[k] === ans.split('.')[j]) {
              actual++
            }
          }
        }
      }
      return expect === actual
    })
    t.equal(packet.answers.length, test.length * 2, 'Packet Answers Length TEST')
    for (let i = 0; i < discoveryPTR.length; i++) {
      t.same({ name: discoveryPTR[i].name, type: discoveryPTR[i].type, data: true }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns.includes(discoveryPTR[i].data) }, 'Packet TEST')
    }
    for (let i = 0; i < discoveryTXT.length; i++) {
      t.same({ name: true, type: discoveryTXT[i].type, data: discoveryTXT[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: app.dnssd.allServiceIns.includes(discoveryTXT[i].name), type: 'TXT', data: JSON.parse(app.dnssd.txt.get(discoveryTXT[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test('ZWOT PTR Search  TEST No Expressions (only on TXT RR)', function (t) {
  const dnssdQ = []
  const dnssdA = []
  const allService = app.dnssd.allService
  for (let i = 0; i < allService.length; i++) {
    dnssdQ.push({ name: allService[i], type: 'PTR' })
  }
  dnssdA.push({ name: allService[0], type: 'TXT', data: '' })
  mDNS.once('response', function (packet) {
    let discoveryPTR = packet.answers.filter(function (ans) {
      return ans.type === 'PTR'
    })
    let discoveryTXT = packet.answers.filter(function (ans) {
      return ans.type === 'TXT'
    })
    const test = []
    for (let k = 0; k < dnssdA.length; k++) {
      let star = dnssdA[k].name.split('*')
      test.push(
        app.dnssd.allServiceIns.filter((ans) => {
          let expect = 0
          let actual = 0
          for (let i = 0; i < star.length; i++) {
            let compareStart = star[i].split('.').filter((str) => { return str !== '' })
            expect += compareStart.length
            for (let j = 0; j < ans.split('.').length; j++) {
              for (let k = 0; k < compareStart.length; k++) {
                if (compareStart[k] === ans.split('.')[j]) {
                  actual++
                }
              }
            }
          }
          return expect === actual
        }))
    }
    t.equal(packet.answers.length, test.length * 2, 'Packet Answers Length TEST')
    for (let i = 0; i < discoveryPTR.length; i++) {
      t.same({ nameTEST: true, type: discoveryPTR[i].type, data: true }, { nameTEST: allService.includes(discoveryPTR[i].name), type: 'PTR', data: app.dnssd.allServiceIns.includes(discoveryPTR[i].data) }, 'Packet TEST')
    }
    for (let i = 0; i < discoveryTXT.length; i++) {
      t.same({ name: true, type: discoveryTXT[i].type, data: discoveryTXT[i].data.map((txts) => { return txts.toString('utf8') }) }, { name: app.dnssd.allServiceIns.includes(discoveryTXT[i].name), type: 'TXT', data: JSON.parse(app.dnssd.txt.get(discoveryTXT[i].name)) }, 'Packet TEST')
    }
    t.end()
  })
  mDNS.query({ questions: dnssdQ, additionals: dnssdA })
})
test.onFinish(() => {
  app.destroy()
})
