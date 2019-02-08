const wtm=require('../wtm');
const fs=require('fs');
class webthings{
	initThings(){
		return new Promise(function(resolve){
			function category(type){
				let category=JSON.parse(fs.readFileSync(`category.json`,'utf8'));
				for(let i=0 ; i<Object.keys(category).length; i++){
					let field=Object.keys(category)[i];
					if(field===type.type){
						let service=Object.keys(category[type.type]);
						for(let j=0 ; j<service.length ; j++){
							if(service[j]==type.subtype){
								return category[type.type][service[j]];
							}
						}
					}
				}
			}
			let map=new Map();
			let config=JSON.parse(fs.readFileSync(`config.json`,'utf8'));	
			for(let i=0;i<Object.keys(config.WoTs).length;i++){
				let service=config.WoTs[Object.keys(config.WoTs)[i]];
				let type={};
				type.type=service.path.split('/')[1];
				type.subtype=Object.keys(config.WoTs)[i];
				if(category(type)!==undefined){
					let values={};
					values[category(type).valueName]=category(type).init;
					map.set(Object.keys(config.WoTs)[i],values);
				}
			}
			map.forEach(function(value, key){
				let obj={};
				obj.configPath="";
				obj.rootPath="public/";
				obj.values=value;
				obj.serviceName=key;
			});
			resolve();
		});	
	}
}
module.exports=new webthings();
