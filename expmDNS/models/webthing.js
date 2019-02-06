const wtm=require('../wtm');
class webthings{
	initThings(){
		return new Promise(function(resolve){
			let path={};
			path.configPath="";
			path.rootPath="public/";	
			let config=JSON.parse(fs.readFileSync(`config.json`,'utf8'));		
			console.log("test");
			for(let i=0;i<Object.keys(config.WoTs).length;i++){
				let service=config.WoTs[Object.keys(config.WoTs)[i]];
				console.log(service.path.split('/'));
			}
			resovle();
		});	
	}
}
module.exports=new webthings();
