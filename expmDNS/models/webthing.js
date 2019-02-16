const wtm=require('../wtm');
const fs=require('fs');
const WebSocketServer = require('websocket').server;
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
			let subscription=[];
			for(let i=0;i<Object.keys(config.WoTs).length;i++){
				let service=config.WoTs[Object.keys(config.WoTs)[i]];
				let type={};
				let obj={}; 
				type.type=service.path.split('/')[1];
				type.subtype=Object.keys(config.WoTs)[i];
				if(category(type)!==undefined){
					let values={};
					values[category(type).valueName]=category(type).init;
					map.set(`${service.path}${type.subtype}/${service.id}`,values);
				}
				if(type.type === "properties" || type.type  ==="actions"){
					obj.subscriptions={};
					obj.subscriptions.id=i;
					obj.subscriptions.subscriberId="";
					obj.subscriptions.type="websocket";
					obj.subscriptions.resource=`${config.WoTs[Object.keys(config.WoTs)[i]].path}${Object.keys(config.WoTs)[i]}/${config.WoTs[Object.keys(config.WoTs)[i]].id}`;
					Object.assign(config.WoTs[Object.keys(config.WoTs)[i]].tags,obj);
					subscription.push(obj);
				}
			}
			let seviceitem=map.entries();
			for(let i = 0 ; i< map.size ; i++){
				let item=seviceitem.next().value;
				let obj={};
				obj.configPath="";
				obj.rootPath="public/";
				obj.path=item[0];
				obj.values=item[1];	
				wtm.insertValues(obj);
			}
			resolve({configPath:"",rootPath:"public/",data:subscription});
		});	
	}
	createWebsocket(server){
		function originIsAllowed(origin) {
	  		return true;
		}
		let wsServer = new WebSocketServer({
    		httpServer: server,
    		autoAcceptConnections: false
		});
		wsServer.on('request', function(request) {
			if (!originIsAllowed(request.origin)) {
			      // Make sure we only accept requests from an allowed origin
	      			request.reject();
		      		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	      			return;
	    		}
	    
			let connection = request.accept('echo-protocol', request.origin);
			console.log((new Date()) + ' Connection accepted.');
			connection.on('message', function(message) {
		        if (message.type === 'utf8') {
	        		console.log(`message.utf8Data :${message.utf8Data}`)
		        	let queryData=JSON.parse(message.utf8Data);
			/*
		        	console.log(`profile/${queryData.name}/${queryData.type}/${queryData.name}.json`);
				setInterval(function(){
	        			fs.readFile(`profile/${queryData.name}/${queryData.data}/${queryData.name}.json`,'utf8',function(err,data){
	        				// console.log(data);
	        				connection.sendUTF(data);
		        		});
		        	},1000); 
			*/
	        	}
	    		});
	    		connection.on('close', function(reasonCode, description) {
	        		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	    		});
		});
	}
}
module.exports=new webthings();
