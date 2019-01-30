class backend{
	navigateGet(req, res, next){
		res.write("GET");
		res.end();
	}
	navigatePut(req, res, next){
		let put=['/','/properties','/things'];	
		if(req.url=='/'){
			res.write(`${req.url}`);
		}else{
			let flag=true;
			for(let i=1; i<put.length ; i++){
				if(req.url.includes(put[i])){
					flag=false;
					res.write(`${req.url}`);
				}
			}
			if(flag)
				res.writeHead("404",[]);
		}
		res.end();
	}
	navigatePost(req, res, next){
		let post=['/','actions','properties','things'];	
		if(req.url=='/'){
			res.write(`${req.url}`);
		}else{
			let flag=true;
			for(let i=1; i<post.length ; i++){
				if(req.url.includes(post[i])){
					flag=false;
					res.write(`${req.url}`);
				}
			}
			if(flag)
				res.writeHead("404",[]);
		}
		res.end();

	}
	navigateDel(req, res, next){
		let del=['actions','subscriptions'];
		let flag=true;
		for(let i=0; i<del.length ; i++){
			if(req.url.includes(del[i])){
				flag=false;
				res.write(`${req.url}`);
			}
		}
		if(flag)
			res.writeHead("404",[]);

		res.end();
	}
}
module.exports=new backend();
