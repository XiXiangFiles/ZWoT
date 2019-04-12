'use strict'
const unifiable = require('./unfilable.js')
const o = require('../get-objvalues')
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
    function parse (object, char) {
      const res = []
      for (let i = 0; i < Object.keys(object).length; i++) {
        if (char === 'key') {
          res.push(Object.keys(object)[i])
        } else {
          const ans = o.get(object[Object.keys(object)[i]], `x.${char}`)
          if (ans) {
            res.push(ans)
          }
        }
      }
      return res
    }
    function putData (arr, data) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === undefined) {
          arr[i] = ''
        }
        if (data[1].length === 0) {
          arr[i] += data[0] + ' '
        } else {
          arr[i] += data[1][i % data[1].length] + ' '
        }
      }
    }
    const split = expression.split(' ')
    const ans = new Map()
    for (let i = 0; i < split.length; i++) {
      const pasrseRes = parse(value, split[i])
      ans.set(split[i], pasrseRes)
    }
    let interatre = ans.entries()
    const finalans = new Array(Object.keys(value).length)
    for (let j = 0; j < ans.size; j++) {
      putData(finalans, interatre.next().value)
    }
    return finalans
  }
}
module.exports = new Unifiable()
