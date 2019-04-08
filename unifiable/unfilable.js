'use strict'

exports.boolExp = function (char) {
  switch (char) {
    case '===': return true
    case '!==': return true
    case '&&': return true
    case '||': return true
    case '<=': return true
    case '>=': return true
    default : return false
  }
}
exports.parseOperator = function (char) {
  switch (char) {
    case 'eq': return '==='
    case 'en': return '!=='
    case 'Λ': return '&&'
    case 'V': return '||'
    case 'le': return '<='
    case 'ge': return '>='
  }
}
exports.parseValue = function (expression, values) {

}
