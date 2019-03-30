const fs = require('fs')
const datetime = require('../node_modules/node-datetime')
let dirTree = require('../node_modules/directory-tree')
function WTM () {
  let dir = new Set()
  function mkdir (path) {
    try {
      fs.mkdirSync(path)
    } catch (err) {
    }
  }
  this.mkdirFloder = function (obj) {
    return new Promise(function (resolve) {
      let configPath = obj.configPath
      let rootPath = obj.rootPath
      let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
      let config = JSON.parse(file)
      mkdir(`${rootPath}root`)
      for (let i = 0; i < config.folder.length; i++) {
        mkdir(`${rootPath}root/${config.folder[i]}`)
      }
      resolve()
    })
  }
  this.init = function (obj) {
    return new Promise(function (resolve) {
      function generateLink (name) {
        return 'Link:<' + name + '/>; rel="' + name + '"\n'
      }
      let configPath = obj.configPath
      let rootPath = obj.rootPath
      let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
      let config = JSON.parse(file)
      let dt = datetime.create()
      let profile = {}
      let Links = ''
      profile.id = 0
      profile.name = config.Instance
      profile.description = config.WoTs[config.Instance].description
      profile.createdAt = dt.format('Y-m-d H:M:S')
      profile.updateAt = dt.format('Y-m-d H:M:S')
      for (let i = 0; i < config.folder.length; i++) { Links += generateLink(config.folder[i]) }

      fs.writeFileSync(`${rootPath}root/links`, Links)
      fs.writeFileSync(`${rootPath}root/${config.Instance}.json`, JSON.stringify(profile))
      for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
        if (Object.keys(config.WoTs)[i] !== config.Instance) {
          let obj = {}
          let link = `Link:<model/>; rel="model"`
          obj.id = config.WoTs[Object.keys(config.WoTs)[i]].id
          obj.name = Object.keys(config.WoTs)[i]
          obj.description = config.WoTs[Object.keys(config.WoTs)[i]].description
          obj.values = config.WoTs[Object.keys(config.WoTs)[i]].values
          obj.status = config.WoTs[Object.keys(config.WoTs)[i]].status
          obj.tags = config.WoTs[Object.keys(config.WoTs)[i]].tags
          mkdir(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}`)
          mkdir(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}`)
          mkdir(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}`)
          try {
            fs.writeFileSync(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/links`, link)
            fs.writeFileSync(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}/${config.Instance}.json`, JSON.stringify(obj))
          } catch (e) {
            console.error(e)
          }
        }
      }
      resolve()
    })
  }
  this.adjust = function (obj) {
    return new Promise(function (resolve) {
      let configPath = obj.configPath
      let rootPath = obj.rootPath
      let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
      let config = JSON.parse(file)
      let services = new Map()
      dirTree(`${rootPath}root`, { extensions: /.json$/ }, function (path, item) {
        dir.add(path.path)
        let splitPath = path.path.split('/')
        if (splitPath.length > 5) {
          let serviceName = splitPath[2]
          let content = splitPath[3]
          for (let i = 4; i < splitPath.length; i++) {
            content += ':' + splitPath[i]
          }
          services.set(serviceName, content)
        }
      })
      let service = services.entries()
      let model = {}
      model.properties = {}
      model.properties.link = '/properties'
      model.properties.title = 'List of Properties'
      model.properties.resource = {}
      model.actions = {}
      model.actions.link = '/actions'
      model.actions.title = 'Actions of this Web Thing'
      model.actions.resource = {}
      model.custom = {}
      model.custom.resource = {}
      for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
        if (config.WoTs[Object.keys(config.WoTs)[i]].path.split('/')[1] != '' && config.WoTs[Object.keys(config.WoTs)[i]].path.split('/')[1] !== undefined) {
          model[config.WoTs[Object.keys(config.WoTs)[i]].path.split('/')[1]].resource[Object.keys(config.WoTs)[i]] = []
        }
      }
      let promise = new Promise(function (resolve) {
        for (let j = 0; j < services.size; j++) {
          let serviceEntry = service.next().value
          let path = serviceEntry[1].replace(/:/gi, '/')
          switch (serviceEntry[0]) {
            case 'properties':
              try {
                model.properties.resource[serviceEntry[1].split(':')[0]].push(JSON.parse(fs.readFileSync(`${rootPath}root/properties/${path}`, 'utf8')))
              } catch (err) {

              }
              break
            case 'actions':
              try {
                model.actions.resource[serviceEntry[1].split(':')[0]].push(JSON.parse(fs.readFileSync(`${rootPath}root/actions/${path}`, 'utf8')))
              } catch (err) {

              }
              break
            case 'custom':
              try {
                model.custom.resource[serviceEntry[1].split(':')[0]].push(JSON.parse(fs.readFileSync(`${rootPath}root/custom/${path}`, 'utf8')))
              } catch (err) {

              }
              break
          }
        }
        resolve(model)
      })
      promise.then(function (full) {
        let model = full
        fs.writeFileSync(`${rootPath}root/model/${config.Instance}.json`, JSON.stringify(model))
        fs.writeFileSync(`${rootPath}root/properties/links`, `Link:http://${config.A.data}/properties;rel="type"`)
        fs.writeFileSync(`${rootPath}root/properties/${config.Instance}.json`, JSON.stringify(model.properties.resource))
        fs.writeFileSync(`${rootPath}root/actions/links`, `Link:http://${config.A.data}/actions;rel="type"`)
        fs.writeFileSync(`${rootPath}root/actions/${config.Instance}.json`, JSON.stringify(model.actions.resource))
        fs.writeFileSync(`${rootPath}root/custom/links`, `Link:http://${config.A.data}/custom;rel="type"`)
        fs.writeFileSync(`${rootPath}root/custom/${config.Instance}.json`, JSON.stringify(model.custom.resource))
        let properties = model.properties.resource
        let actions = model.actions.resource
        let custom = model.custom.resource
        for (let j = 0; j < Object.keys(properties).length; j++) {
          fs.writeFileSync(`${rootPath}root/properties/${Object.keys(properties)[j]}/${config.Instance}.json`, JSON.stringify(properties[Object.keys(properties)[j]]))
          fs.writeFileSync(`${rootPath}root/properties/${Object.keys(properties)[j]}/links`, `Link:http://${config.A.data}/properties/${Object.keys(properties)[j]};rel="type"`)
        }
        for (let j = 0; j < Object.keys(actions).length; j++) {
          fs.writeFileSync(`${rootPath}root/actions/${Object.keys(actions)[j]}/${config.Instance}.json`, JSON.stringify(actions[Object.keys(actions)[j]]))
          fs.writeFileSync(`${rootPath}root/actions/${Object.keys(actions)[j]}/links`, `Link:http://${config.A.data}/actions/${Object.keys(actions)[j]};rel="type"`)
        }
        for (let j = 0; j < Object.keys(custom).length; j++) {
          fs.writeFileSync(`${rootPath}root/custom/${Object.keys(custom)[j]}/${config.Instance}.json`, JSON.stringify(custom[Object.keys(custom)[j]]))
          fs.writeFileSync(`${rootPath}root/custom/${Object.keys(custom)[j]}/links`, `Link:http://${config.A.data}/custom/${Object.keys(custom)[j]};rel="type"`)
        }
        resolve(dir)
      })
    })
  }
  this.getAllPath = function (obj) {
    function scan (path) {
      let allpath = []
      try {
        let floder = fs.readdirSync(path)
        for (let i = 0; i < floder.length; i++) {
          allpath = allpath.concat(scan(`${path}/${floder[i]}`))
        }
      } catch (e) {
        allpath.push(e.path)
      }
      return allpath
    }
    let rootPath = obj.rootPath
    return scan(`${rootPath}root`)
  }
  this.getWtm = function (path) {
    let configPath = path.configPath
    let rootPath = path.rootPath
    let dir = path.path
    let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
    let config = JSON.parse(file)
    if (path.path[path.path.length - 1] !== '/') { dir += `/${config.Instance}.json` } else { dir += `${config.Instance}.json` }

    try {
      return fs.readFileSync(`${rootPath}root${dir}`, 'utf8')
    } catch (e) {
      return undefined
    }
  }
  this.getLink = function (path) {
    let rootPath = path.rootPath
    let dir = path.path
    if (path.path[path.path.length - 1] !== '/') { dir += `/links` } else { dir += `links` }

    try {
      return fs.readFileSync(`${rootPath}root${dir}`, 'utf8')
    } catch (e) {
      return undefined
    }
  }
  this.insertValues = function (obj) {
    let configPath = obj.configPath
    let dir = obj.path
    let values = obj.values
    let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
    let config = JSON.parse(file)
    let flag = true
    for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
      if (`${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}` === dir) {
        flag = false
        config.WoTs[Object.keys(config.WoTs)[i]].values = values
      }
    }
    if (flag) { return undefined } else {
      fs.writeFileSync(`${configPath}config.json`, JSON.stringify(config))
      return true
    }
  }
  this.postWtm = function (path) {
    let configPath = path.configPath
    let dir = path.path
    let data = path.data
    let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
    let config = JSON.parse(file)
    let flag = true
    for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
      let service = config.WoTs[Object.keys(config.WoTs)[i]]
      if (service.path.split('/')[1] === dir.split('/')[1]) {
        let servicePath = `/${service.path.split('/')[1]}/${Object.keys(config.WoTs)[i]}/${service.id}`
        if (servicePath === dir && config.WoTs[Object.keys(config.WoTs)[i]].status !== undefined) {
          if (data.status !== undefined) {
            config.WoTs[Object.keys(config.WoTs)[i]].status = data.status
            flag = false
          }
        }
      }
    }
    if (flag) {
      if (fs.existsSync(`${path.rootPath}/logs/postlog`)) {
        let logs = fs.readFileSync(`${path.rootPath}/logs/postlog`, 'utf8')
        logs = logs.split('\n')
        return logs[logs.length - 2]
      } else { return undefined }
    } else {
      let wtm = this
      fs.writeFileSync(`${configPath}config.json`, JSON.stringify(config))
      wtm.init(path).then(() => { wtm.adjust(path) })
      if (fs.existsSync(`${path.rootPath}/logs/postlog`)) {
        fs.appendFile(`${path.rootPath}/logs/postlog`, path.host + dir + '\n')
        return path.host + dir
      } else {
        fs.writeFile(`${path.rootPath}/logs/postlog`, path.host + dir + '\n')
        return path.host + dir
      }
    }
  }
  this.delWtmService = function (path) {
    let configPath = path.configPath
    let dir = path.path
    let file = fs.readFileSync(`${configPath}config.json`, 'utf8')
    let config = JSON.parse(file)
    let flag = true
    if (dir === '/') {
      config.WoTs = {}
      flag = false
    } else {
      for (let i = 0; i < Object.keys(config.WoTs).length; i++) {
        let service = config.WoTs[Object.keys(config.WoTs)[i]]
        if (service.path.split('/')[1] === dir.split('/')[1]) {
          let servicePath = `/${service.path.split('/')[1]}/${Object.keys(config.WoTs)[i]}/${service.id}`
          if (servicePath === dir) {
            delete config.WoTs[Object.keys(config.WoTs)[i]]
            flag = false
          }
        }
      }
    }
    if (flag) {
      return undefined
    } else {
      let wtm = this
      wtm.reset(path)
      fs.writeFileSync(`${configPath}config.json`, JSON.stringify(config))
      return true
    }
  }
  this.reset = function (path) {
    let wtm = this
    let promise = new Promise(function (resolve) {
      resolve(wtm.getAllPath(path))
    })
    promise.then(function (all) {
      for (let i = 0; i < all.length; i++) {
        fs.writeFileSync(`${all[i]}`, '{}', 'utf8')
      }
      try {
        wtm.init(path).then(() => { wtm.adjust(path) })
      } catch (err) {
        console.log(err)
      }
    })
  }
  this.insertSubscription = function (path) {
    let configPath = path.configPath
    let rootPath = path.rootPath
    let config = JSON.parse(fs.readFileSync(`${configPath}config.json`, 'utf8'))
    fs.writeFileSync(`${rootPath}root/subscription/${config.Instance}.json`, JSON.stringify(path.data))
  }
  this.getConfig = function (path) {
    let configPath = path.configPath
    return JSON.parse(fs.readFileSync(`${configPath}config.json`, 'utf8'))
  }
  this.updateConfig = function (obj) {
    let configPath = obj.configPath
    fs.writeFileSync(`${configPath}config.json`, JSON.stringify(obj.config))
  }
}
module.exports = new WTM()
