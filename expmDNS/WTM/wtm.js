const fs=require('fs');
const color=require('colors');
const http = require('http');
const datetime=require('../node_modules/node-datetime');
const decode = require('../node_modules/urldecode');
const dirTree=require('../node_modules/directory-tree');
let config;
let file=fs.readFileSync('../config.json','utf8');
config=JSON.parse(file);
function wtm(){
	function mkdir(path){
		try{
			fs.mkdirSync(path,(err)=>{});
		}catch(err){
		}
	}
	this.mkdirFloder= function(){
		return new Promise(function(resolve){
			mkdir('root');
			config.folder.forEach(function(floder){
				mkdir(`root/${floder}`);
			});
			resolve();
		});
	}
	this.init=function(){
		return new Promise(function(resolve){
			function generateLink(name){
				return str='Link:<'+name+'/>; rel="'+name+'"\n';
			}
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

			fs.writeFileSync(`root/links`,Links, function (err) {});
			fs.writeFileSync(`root/${config.Instance}.json`,JSON.stringify(profile), function (err) {});
			
			for(let i=0 ; i<Object.keys(config.WoTs).length;i++){
				if(Object.keys(config.WoTs)[i]!==config.Instance){
					let obj={};
					let link=`Link:<model/>; rel="model"`
					obj.id=config.WoTs[Object.keys(config.WoTs)[i]].id;
					obj.name=Object.keys(config.WoTs)[i];
					obj.description=config.WoTs[Object.keys(config.WoTs)[i]].description;
					obj.values={};

					mkdir(`${config.WoTs[Object.keys(config.WoTs)[i]].path}`);
					mkdir(`${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}`);
					mkdir(`${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}`);
					try{
						fs.writeFileSync(`${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/links`,
							link,(err)=>{}
						);
						fs.writeFileSync(`${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}/${config.Instance}.json`,
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
	this.adjust=function(){
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
			let services=new Map();
			let servicesWriteFile=new Map();
			let tree = dirTree('root',{ extensions: /.json$/ },function(path,item){
				let splitPath=path.path.split('/');
				if(splitPath.length > 3){
					let serviceName=splitPath[1]
					let content=splitPath[2];
					for(let i=3 ;i<splitPath.length ; i++ ){
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
			for(let j=0 ; j< services.size; j++){
				let serviceEntry = service.next().value;
				let path=serviceEntry[1].replace(/:/gi,'/');
				floder=serviceEntry[0];
				switch(floder){
					case 'properties':
						model.properties.resource.push(JSON.parse(fs.readFileSync(`root/properties/${path}`,'utf8',function(err){})));
					break;
					case 'actions':
						model.actions.resource.push(JSON.parse(fs.readFileSync(`root/actions/${path}`,'utf8',function(err){})));
					break;
					case 'custom':
						model.custom.resource.push(JSON.parse(fs.readFileSync(`root/custom/${path}`,'utf8',function(err){})));
					break;
				}
			}
			fs.writeFileSync(`root/model/${config.Instance}.json`,JSON.stringify(model),(err)=>{});
			fs.writeFileSync(`root/properties/links`,`Link:http://${config.A.data}/properties;rel="type"`,(err)=>{});
			fs.writeFileSync(`root/properties/${config.Instance}.json`,JSON.stringify(model.properties.resource),(err)=>{});
			fs.writeFileSync(`root/actions/links`,`Link:http://${config.A.data}/actions;rel="type"`,(err)=>{});
			fs.writeFileSync(`root/actions/${config.Instance}.json`,JSON.stringify(model.actions.resource),(err)=>{});
			fs.writeFileSync(`root/custom/links`,`Link:http://${config.A.data}/custom;rel="type"`,(err)=>{});
			fs.writeFileSync(`root/custom/${config.Instance}.json`,JSON.stringify(model.custom.resource),(err)=>{});
			
			let properties=classify(model.properties.resource);
			let actions=classify(model.actions.resource);
			let custom=classify(model.custom.resource);
			for(let j = 0 ; j< properties.length ;j++){
				let obj=properties[j];
				fs.writeFileSync(`root/properties/${obj[Object.keys(properties[j])][j].name}/${config.Instance}.json`,JSON.stringify(obj[Object.keys(properties[j])][j]),(err)=>{}); 	
				fs.writeFileSync(`root/properties/${obj[Object.keys(properties[j])][j].name}/links`,`Link:http://${config.A.data}/properties/${obj[Object.keys(properties[j])][j].name};rel="type"`)
			}
			for(j = 0 ; j< actions.length ;j++){
				let obj=actions[j];
				fs.writeFileSync(`root/actions/${obj[Object.keys(actions[j])][j].name}/${config.Instance}.json`,JSON.stringify(obj[Object.keys(actions[j])][j]),(err)=>{}); 	
				fs.writeFileSync(`root/actions/${obj[Object.keys(actions[j])][j].name}/links`,`Link:http://${config.A.data}/actions/${obj[Object.keys(actions[j])][j].name};rel="type"`)
			}
			for(j = 0 ; j< custom.length ;j++){
				let obj=custom[j];
				fs.writeFileSync(`root/custom/${obj[Object.keys(custom[j])][j].name}/${config.Instance}.json`,JSON.stringify(obj[Object.keys(custom[j])][j]),(err)=>{}); 	
				fs.writeFileSync(`root/custom/${obj[Object.keys(custom[j])][j].name}/links`,`Link:http://${config.A.data}/custom/${obj[Object.keys(custom[j])][j].name};rel="type"`)
			}
			resolve();
		});
	}
}
let setupTest=new wtm;
setupTest.mkdirFloder().then(function(){
	setupTest.init().then(function(){
		setupTest.adjust(function(){

		});
	})
});
