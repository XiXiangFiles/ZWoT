exports.get = function (object, exp) {
  if (typeof (exp) === 'string') {
    try {
      const theKey = exp.split(/\.|\['?"?[a-zA-Z1-9]*'?"?\]/)[0]
      // eslint-disable-next-line no-eval
      return eval(exp.replace(`${theKey}`, 'object'))
    } catch (err) {
      return undefined
    }
  } else {
    return undefined
  }
}
