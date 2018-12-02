const mdns=require('multicast-dns')();
const fs=require('fs');
const color=require('colors');
let config;
fs.readFile('config.json','utf8',function(err,data){
	config=JSON.parse(data);
});
mdns.on('query',function(res){
	let promise=new Promise(function(resolve,reject){
		let respond={};
		let answers=[];
		let addtionals=[];
	
		console.log(color.green(res.questions.map(function(element){return element.type})));

		if(res.questions.map((element)=>{return element.type}).includes('PTR')){
			if(res.questions.map(function(element){if(element.type=='PTR'){return element.name}}).includes(config.Service)){
				let obj={};
				obj.name=config.Service;
				obj.type='PTR';
				obj.ttl=120;
				obj.data=config.Instance+'.'+config.Service;
				answers.push(obj);
					
				if(res.questions.map(function(element){if(element.type=='PTR'){return element.name}}).includes("_services._dns-sd._udp.local")){
					let obj={};
					obj.name="_services._dns-sd._udp.local";
					obj.type='PTR';
					obj.ttl=120;
					obj.data=config.Service;
					answers.push(obj);
				}

			}
			
		}
		if(res.questions.map((element)=>{return element.type}).includes('SRV')){
			if(res.questions.map(function(element){if(element.type=='SRV'){return element.name}}).includes(config.Instance+'.'+config.Service)){
				let obj={};
				obj.name=config.Instance+'.'+config.Service;
				obj.type='SRV';
				obj.ttl=120;
				obj.data={};
				obj.data.port=config.SRV.port;
				obj.data.weight=config.SRV.weigth;
				obj.data.priority=config.SRV.priority;
				obj.data.target=config.A.name;
				answers.push(obj);

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
				
				answers.push(obj);

			}
		}
		if(res.questions.map((element)=>{return element.type}).includes('A')){
			if(res.questions.map(function(element){if(element.type=='A'){return element.name}}).includes(config.A.name)){
				let obj={};
				obj.name=config.A.name;
				obj.type='A';
				obj.ttl=120;
				obj.data=config.A.data;
				obj.flush=true;
				answers.push(obj);
			}
		}
		if(answers.length >0 && answers.map(function(answers){ return answers.type}).includes('SRV') && !answers.map(function(answers){ return answers.type}).includes('TXT')){
				let obj={};
				obj.name=config.Instance+'.'+config.Service;
				obj.type='TXT';
				obj.ttl=120;
				obj.data=[];
				for(let i = 0 ; i<config.TXT.length ;i++)
					obj.data.push(Buffer.from(config.TXT[i],'ascii'));
				
				addtionals.push(obj);

		}
		if(answers.length >1 && !answers.map(function(answers){ return answers.type}).includes('A')){
			let obj={};
			obj.name=config.A.name;
			obj.type='A';
			obj.ttl=120;
			obj.data=config.A.data;
			obj.flush=true;	
			addtionals.push(obj);
		}
		respond.answers=answers;
		respond.additionals=addtionals;
		resolve(respond);
	});
	promise.then(function(full){
		if(full.answers.length>0 && full.additionals !=undefined){	
			mdns.respond({answers:full.answers,additionals:full.addtionals});
			console.log({answers:full.answers,additionals:full.additionals});
		}else if(full.answers.length>0 && full.additionals ==undefined){	
			mdns.respond({answers:full.answers});
			console.log({answers:full.answers});
		}
	});
});

