const test = require('tape')
const app = require('./app.js')
const mDNS = require('zwot-multicast-dns')()
const color = require('colors')

test('DNS-SD ', function (t) {
  console.log(color.green(app.dnssd.srv))
  console.log(color.green(app.dnssd.txt))
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
    dsnsdQ = []
    t.equal(app.QU, false, 'QM test')
    for(let i = 0; i< packet.answers.length; i++){
      t.same({ name: packet.answers[i].name, type: packet.answers[i].type, data: packet.answers[i].data }, { name: '_services._dns-sd._udp.local', type: 'PTR', data: app.dnssd.allServiceIns[i] }, '_services._dns-sd._udp.local TEST') 
      dnssdQ.push({ name: packet.answers[i].data, type: 'SRV', QU: false })
      dnssdQ.push({ name: packet.answers[i].data, type: 'TXT', QU: false })
    }	  
    mDNS.once('response', function (packet2) {
	dnssdQ = []
    	for (let i = 0; i < packet2.answers.length; i++) {
	  if ( packet2.answers[i].type === 'SRV') {
	    t.equal( app.dnssd.allServiceIns.includes(packet2.answers[i].name), true, 'SRV Name TEST' )
	    t.same( packet2.answers[i].data, JSON.parse(app.dnssd.srv.get(packet2.answers[i].name)), 'SRV Data TEST')
            dnssdQ.push({ name: packet2.answers[i].data.target, type: 'A', QU: false })
	  }
	  if ( packet2.answers[i].type === 'TXT'){
	    t.equal( app.dnssd.allServiceIns.includes(packet2.answers[i].name), true, 'TXT Name TEST' )
	    t.same( packet2.answers[i].data.map((txts) => { return txts.toString('utf8')}) , JSON.parse(app.dnssd.txt.get(packet2.answers[i].name)), 'TXT Data TEST')
	  }
	}
        mDNS.once('response', function (packet3) {
	  for(let i =0; i < packet3.answers.length; i++){
	    t.same({ name: packet3.answers[i].name, type: packet3.answers[i].type, data: packet3.answers[i].data }, { name: app.dnssd.a.name, type: 'A', data: app.dnssd.a.data }, 'Packet TEST')
	  }
	  t.end();
	})
        mDNS.query(dnssdQ)
    })
    mDNS.query(dnssdQ)
  })
  mDNS.query(dnssdQ)
})

test.onFinish(() => {
  app.destroy()
})
