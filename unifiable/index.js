'use strict'
const unifiable = require('./unfilable.js')
const color = require('../node_modules/colors')
function Unifiable () {
  this.encode = function (expression) {
    let answers = ''
    const expAns = expression.split(' ').filter((str) => {
      if (str) return true
    })
    for (let i = 0; i < expAns.length; i++) {
      answers += expAns[i] = unifiable.toOperator(expAns[i]) + ' '
    }
    return answers.trim()
  }
  this.decode = function (expression) {
    let answers = ''
    const expAns = expression.split(' ').filter((str) => {
      if (str) return true
    })
    for (let i = 0; i < expAns.length; i++) {
      answers += expAns[i] = unifiable.toUnfilable(expAns[i]) + ' '
    }
    return answers.trim()
  }
  this.parseValue = function (expression, value) {
  }
}
module.exports = new Unifiable()
