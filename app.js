var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const fs = require('fs')
var indexRouter = require('./routes/index')

var app = express()

let mdns = require('./mDNS/server.js')
// if (mdns.probe()) {
// setTimeout(() => {
app.dnssd = mdns.init()
mdns.listen()
// }, 1000)
// }
mdns.on('QU', function (QU) {
  app.QU = QU
})
let flag = 0
async function update () {
  app.dnssd = mdns.init()
  if (app.dnssd) {
    flag = 0
  }
}
fs.watch('./config.json', { recursive: true }, function (eventType, filename) {
  flag++
  if (flag !== 0) {
    update()
    flag--
  }
})

// set up wtm
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})
app.destroy = function () {
  process.exit()
}

module.exports = app
