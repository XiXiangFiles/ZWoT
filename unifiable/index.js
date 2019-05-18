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
          res.push(`"${Object.keys(object)[i]}"`)
        } else {
          const ans = o.get(object[Object.keys(object)[i]], `x.${char}`)
          if (ans) {
            typeof (ans) === 'string' ? res.push(`"${ans}"`) : res.push(`"${ans}"`)
          } else {
            res.push(undefined)
          }
        }
      }
      return res
    }
    function putData (arr, data) {
      const ans = data[1]
      for (let i = 0; i < ans.length; i++) {
        ans[i] !== undefined ? arr[i] += `${ans[i]} ` : unifiable.checkOperator(`${data[0]}`) ? arr[i] += `${data[0]} ` : arr[i] += `"${data[0].replace(/"|'/g, '')}" `
      }
    }
    const split = expression.split(' ')
    const ans = new Array(split.length)
    for (let i = 0; i < split.length; i++) {
      const parseRes = parse(value, split[i])
      ans[i] = parseRes
    }
    const finalans = new Array(Object.keys(value).length)
    for (let h = 0; h < finalans.length; h++) {
      finalans[h] = ''
    }
    for (let j = 0; j < ans.length; j++) { // first words, second words
      const input = new Array(2)
      input[0] = split[j] // origine word
      input[1] = ans[j] // ans word
      putData(finalans, input)
    }
    console.log(finalans)
    return finalans
  }
}
module.exports = new Unifiable()
