const mdns=require('multicast-dns')();
const fs=require('fs');
let config;
fs.readFile('config.json','utf8',function(err,data){
	config=JSON.parse(data);
});
mdns.on('query',function(res){
	let promise=new Promise(function(resolve,reject){
		let arr=[];
		if(res.questions.map((element)=>{return element.type}).includes('PTR')){
			if(res.questions.map(function(element){if(element.type=='PTR'){return element.name}}).includes(config.Service)){
				let obj={};
				obj.name=config.Service;
				obj.type='PTR';
				obj.ttl=120;
				obj.data=config.Instance+'.'+config.Service;
				arr.push(obj);
			}
		}
		if(res.questions.map((element)=>{return element.type}).includes('SRV')){
			if(res.questions.map(function(element){if(element.type=='SRV'){return element.name}}).includes(config.Instance+'.'+config.Service)){
				let obj={};
				obj.name=config.Instance+'.'+config.Service;
				obj.type='SRV';
				obj.data={};
				obj.data.ttl=120;
				obj.data.port=config.SRV.port;
				obj.data.weight=config.SRV.weigth;
				obj.data.priority=config.SRV.priority;
				obj.data.target=config.A.name;
				arr.push(obj);
			}
		}
		if(res.questions.map((element)=>{return element.type}).includes('TXT')){
			if(res.questions.map(function(element){if(element.type=='TXT'){return element.name}}).includes(config.Instance+'.'+config.Service)){
				let obj={};
				obj.name=config.Instance+'.'+config.Service;
				obj.type='TXT';
				obj.ttl=120;
				obj.data=[];
				for(let i = 0 ; i<config.TXT.length ;i++)
					obj.data.push(Buffer.from(config.TXT[i],'ascii'));
				arr.push(obj);
			}
		}
		if(res.questions.map((element)=>{return element.type}).includes('A')){
			if(res.questions.map(function(element){if(element.type=='A'){return element.name}}).includes(config.A.name)){
				let obj={};
				obj.name=config.A.name;
				obj.type='A';
				obj.ttl=120;
				obj.data=config.A.data;
				arr.push(obj);
			}
		}
		resolve(arr);
	});
	promise.then(function(full){
		if(full.length>0){	
			mdns.respond({answers:full});
			console.log(full);
		}
	});
});

