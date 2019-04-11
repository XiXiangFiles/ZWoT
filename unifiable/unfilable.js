'use strict'

exports.toOperator = function (char) {
  switch (char) {
    case 'eq': return '==='
    case 'en': return '!=='
    case 'Λ': return '&&'
    case 'V': return '||'
    case 'le': return '<='
    case 'ge': return '>='
    default : return char
  }
}
exports.toUnfilable = function (char) {
  switch (char) {
    case '===': return 'eq'
    case '!==': return 'en'
    case '&&': return 'Λ'
    case '||': return 'V'
    case '<=': return 'le'
    case '>=': return 'ge'
    default : return char
  }
}
