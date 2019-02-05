const fs=require('fs');
const datetime=require('../node_modules/node-datetime');
const decode = require('../node_modules/urldecode');
let  dirTree=require('../node_modules/directory-tree');
function wtm(){

	let dir=new Set();
	function mkdir(path){
		try{
			fs.mkdirSync(path,(err)=>{});
		}catch(err){
		}
	}
	this.mkdirFloder= function(obj){
		return new Promise(function(resolve){
			let configPath=obj.configPath;
			let rootPath=obj.rootPath;
			let file=fs.readFileSync(`${configPath}config.json`,'utf8');
			let config=JSON.parse(file);
			mkdir(`${rootPath}root`);
			config.folder.forEach(function(floder){
				mkdir(`${rootPath}root/${floder}`);
			});
			resolve();
		});
	}
	this.init=function(obj){
		return new Promise(function(resolve){
			function generateLink(name){
				return str='Link:<'+name+'/>; rel="'+name+'"\n';
			}
			let configPath=obj.configPath;
			let rootPath=obj.rootPath;
			let file=fs.readFileSync(`${configPath}config.json`,'utf8');
			let config=JSON.parse(file);
			let dt = datetime.create();
			let profile={}
			let Links="";
			profile.id=0;
			profile.name=config.Instance;
			profile.description=config.WoTs[config.Instance].description;
			profile.createdAt=dt.format('Y-m-d H:M:S');
			profile.updateAt=dt.format('Y-m-d H:M:S');
			for(let i=0 ; i< config.folder.length; i++ )
				Links+=generateLink(config.folder[i]);

			fs.writeFileSync(`${rootPath}root/links`,Links, function (err) {});
			fs.writeFileSync(`${rootPath}root/${config.Instance}.json`,JSON.stringify(profile), function (err) {});
			
			for(let i=0 ; i<Object.keys(config.WoTs).length;i++){
				if(Object.keys(config.WoTs)[i]!==config.Instance){
					let obj={};
					let link=`Link:<model/>; rel="model"`
					obj.id=config.WoTs[Object.keys(config.WoTs)[i]].id;
					obj.name=Object.keys(config.WoTs)[i];
					obj.description=config.WoTs[Object.keys(config.WoTs)[i]].description;
					obj.values=config.WoTs[Object.keys(config.WoTs)[i]].values;
					obj.tags=config.WoTs[Object.keys(config.WoTs)[i]].tags;
					mkdir(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}`);
					mkdir(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}`);
					mkdir(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}`);
					try{
						fs.writeFileSync(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/links`,
							link,(err)=>{}
						);
						fs.writeFileSync(`${rootPath}${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}/${config.Instance}.json`,
							JSON.stringify(obj),(err)=>{}
						);
					}catch(e){
						console.error(e);
					}
					
				}
			}
			resolve();
		});
	}
	this.adjust=function(obj){
		return new Promise(function(resolve){
			function classify(services){
				let service= new Set();
				let allService=[];
				for(let i = 0 ; i< services.length ; i++){
					service.add(services[i].name);
				}
				let serviceName=service.values();
				for(i = 0 ; i< service.size ; i++){
					let arr=[]
					let name= serviceName.next().value;
					for(let j = 0 ; j < services.length ; j++){
						if(name===services[j].name){
							arr.push(services[j]);
						}
					}
					allService.push(JSON.parse(`{"${name}":${JSON.stringify(arr)}}`));
				}
				return allService;
			}
			let configPath=obj.configPath;
			let rootPath=obj.rootPath;
			let file=fs.readFileSync(`${configPath}config.json`,'utf8');
			let config=JSON.parse(file);
			let services=new Map();
			let servicesWriteFile=new Map();

			let tree = dirTree(`${rootPath}root`,{ extensions: /.json$/ },function(path,item){
				dir.add(path.path);
				let splitPath=path.path.split('/');
				if(splitPath.length > 4){
					let serviceName=splitPath[2]
					let content=splitPath[3];
					for(let i=4 ;i<splitPath.length ; i++ ){
						content+=":"+splitPath[i];
					}
					services.set(serviceName,content);
				}
			});
			let service=services.entries();
			let model={};
			let propertiesSet=new Set();
			let actionsSet=new Set();
			let customSet = new Set();

			model.properties={};
			model.properties.link="/properties";
			model.properties.title="List of Properties";
			model.properties.resource=[];
			model.actions={};
			model.actions.link="/actions";
			model.actions.title="Actions of this Web Thing";
			model.actions.resource=[];
			model.custom={};
			model.custom.resource=[];
			let promise=new Promise(function(complete){
				for(let j=0 ; j< services.size; j++){
					let serviceEntry = service.next().value;
					let path=serviceEntry[1].replace(/:/gi,'/');
					floder=serviceEntry[1].split(":");
					floder=serviceEntry[0]
					switch(floder){
						case 'properties':
							model.properties.resource.push(JSON.parse(fs.readFileSync(`${rootPath}root/properties/${path}`,'utf8',function(err){})));
							break;
						case 'actions':
							model.actions.resource.push(JSON.parse(fs.readFileSync(`${rootPath}root/actions/${path}`,'utf8',function(err){})));
							break;
						case 'custom':
							model.custom.resource.push(JSON.parse(fs.readFileSync(`${rootPath}root/custom/${path}`,'utf8',function(err){})));
							break;
					}
				}
				complete(model);
			});
			promise.then(function(full){
				let model=full;	
					fs.writeFileSync(`${rootPath}root/model/${config.Instance}.json`,JSON.stringify(model),(err)=>{console.log(err)});
					fs.writeFileSync(`${rootPath}root/properties/links`,`Link:http://${config.A.data}/properties;rel="type"`,(err)=>{});
					fs.writeFileSync(`${rootPath}root/properties/${config.Instance}.json`,JSON.stringify(model.properties.resource),(err)=>{});
					fs.writeFileSync(`${rootPath}root/actions/links`,`Link:http://${config.A.data}/actions;rel="type"`,(err)=>{});
					fs.writeFileSync(`${rootPath}root/actions/${config.Instance}.json`,JSON.stringify(model.actions.resource),(err)=>{});
					fs.writeFileSync(`${rootPath}root/custom/links`,`Link:http://${config.A.data}/custom;rel="type"`,(err)=>{});
					fs.writeFileSync(`${rootPath}root/custom/${config.Instance}.json`,JSON.stringify(model.custom.resource),(err)=>{});
					
					let properties=classify(model.properties.resource);
					let actions=classify(model.actions.resource);
					let custom=classify(model.custom.resource);
					for(let j = 0 ; j< properties.length ;j++){
						let obj=properties[j];
						fs.writeFileSync(`${rootPath}root/properties/${obj[Object.keys(properties[j])][j].name}/${config.Instance}.json`,JSON.stringify(obj[Object.keys(properties[j])][j]),(err)=>{}); 	
						fs.writeFileSync(`${rootPath}root/properties/${obj[Object.keys(properties[j])][j].name}/links`,`Link:http://${config.A.data}/properties/${obj[Object.keys(properties[j])][j].name};rel="type"`)
					}
					for(j = 0 ; j< actions.length ;j++){
						let obj=actions[j];
						fs.writeFileSync(`${rootPath}root/actions/${obj[Object.keys(actions[j])][j].name}/${config.Instance}.json`,JSON.stringify(obj[Object.keys(actions[j])][j]),(err)=>{}); 	
						fs.writeFileSync(`${rootPath}root/actions/${obj[Object.keys(actions[j])][j].name}/links`,`Link:http://${config.A.data}/actions/${obj[Object.keys(actions[j])][j].name};rel="type"`)
					}
					for(j = 0 ; j< custom.length ;j++){
						let obj=custom[j];
						fs.writeFileSync(`${rootPath}root/custom/${obj[Object.keys(custom[j])][j].name}/${config.Instance}.json`,JSON.stringify(obj[Object.keys(custom[j])][j]),(err)=>{}); 	
						fs.writeFileSync(`${rootPath}root/custom/${obj[Object.keys(custom[j])][j].name}/links`,`Link:http://${config.A.data}/custom/${obj[Object.keys(custom[j])][j].name};rel="type"`)
					}
					resolve(dir);
				});
			});
			
	}
	this.getAllPath=function(obj){
		function scan(path){
			let allpath=[];
			try{
				let floder=fs.readdirSync(path, function(err, items) {});
				for(let i=0;i<floder.length;i++){
					allpath=allpath.concat(scan(`${path}/${floder[i]}`));
				}
			}catch(e){
				allpath.push(e.path);
			}
			return allpath
		}
		let configPath=obj.configPath;
		let rootPath=obj.rootPath;
		return scan(`${rootPath}root`);
	}
	this.getWtm=function(path){
		let configPath=path.configPath;
		let rootPath=path.rootPath;
		let dir=path.path;
		let file=fs.readFileSync(`${configPath}config.json`,'utf8');
		let config=JSON.parse(file);
		if(path.path[path.path.length-1]!="/")
			dir+=`/${config.Instance}.json`;
		else
			dir+=`${config.Instance}.json`;
		
		console.log(dir);
		try{
			return fs.readFileSync(`${rootPath}root${dir}`,'utf8');
		}catch(e){
			return undefined;
		}
	}
	this.getLink=function(path){
		let configPath=path.configPath;
		let rootPath=path.rootPath;
		let dir=path.path;
		if(path.path[path.path.length-1]!="/")
			dir+=`/links`;
		else
			dir+=`links`;
		
		try{
			return fs.readFileSync(`${rootPath}root${dir}`,'utf8');
		}catch(e){
			return undefined;
		}	
	}
	this.postWtm=function(path){
		let configPath=path.configPath;
		let rootPath=path.rootPath;
		let dir=path.path;
		let data=path.data;
		
		let file=fs.readFileSync(`${configPath}config.json`,'utf8');
		let config=JSON.parse(file);
		let flag=false;
		for(let i=0 ; i< Object.keys(config.WoTs).length;i++){
			let service=config.WoTs[Object.keys(config.WoTs)[i]];
			if(service.path.split('/')[1]===dir.split('/')[1]){
				servicePath=`/${service.path.split('/')[1]}/${Object.keys(config.WoTs)[i]}/${service.id}`;
				if(servicePath === dir)
					console.log("true");
			}else{
				
			}
		}
		if(flag)
			return undefined;
	}
}
module.exports=new wtm;


