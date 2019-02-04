var express = require('express');
var router = express.Router();
let beckend=require('../models/backend.js');
const wtm=require('../wtm');

let promise=new Promise(function(resolve){
	let obj={};
	obj.configPath="";
	obj.rootPath="public/";
	resolve(wtm.getAllPath(obj));
});
promise.then(function(path){
	path.forEach(function(path){
		let dir=path.split('/');
		let routerPath="/";
		for(let i =1 ; i< dir.length ; i++){
			if(i !==1 && i !== dir.length-1)
				routerPath+=dir[i]+"/";
		}
		router.get(routerPath,beckend.navigateGet);
		router.put(routerPath,beckend.navigatePut);
		router.post(routerPath,beckend.navigatePost);
		router.delete(routerPath,beckend.navigateDel);
	});
});

module.exports = router;
