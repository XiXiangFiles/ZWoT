const wtm=require('../wtm');
class backend{
	navigateGet(req, res, next){
		let path={};
		path.configPath="";
		path.rootPath="public/";
		path.path=req.url;
		let link=wtm.getLink(path);
		let content=wtm.getWtm(path);
		if(link!== undefined)
			res.writeHead("200",{'Link':link.split('\n')});
		if(content!== undefined)
			res.write(content);
		else
			res.writeHead("404",[]);
		res.end();
	}
	navigatePut(req, res, next){
		let path={};
		path.configPath="";
		path.rootPath="public/";
		path.path=req.url;
		let put=['/','properties','things'];	
		if(req.url=='/'){
			res.writeHead('204',['no content']);
		}else{
			let flag=true;
			for(let i=1; i<put.length ; i++){
				if(req.url.includes(put[i])){
					flag=false;
					res.writeHead('204',{Location:`http://${res.req.headers.host}${req.url}`});
				}
			}
			if(flag)
				res.writeHead("404",[]);
		}
		res.end();
	}
	navigatePost(req, res, next){
		let post=['/','actions','properties','things'];	
		let path={};
		path.configPath="";
		path.rootPath="public/";
		path.path=req.url;
		path.data=req.body;
		path.host=res.req.headers.host;
		if(req.url=='/'){
			res.writeHead('204',{Location:`http://${wtm.postWtm(path)}`});
		}else{
			let flag=true;
			for(let i=1; i<post.length ; i++){
				if(req.url.includes(post[i])){
					flag=false;
					res.writeHead('204',{Location:`http://${wtm.postWtm(path)}`});
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
