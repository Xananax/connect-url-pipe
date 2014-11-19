var express = require('express');
var app = express();
var urlPipe = require('../index');

var dynamicRoutes = {
    'toLowerCase':function(req,res,next){
    	if(!req.currentString){return next();}
        req.currentString = req.currentString.toLowerCase();
        next();
    }
,   'replace':function(req,res,next){
		if(!req.currentString){return next();}
        var args = req.urlPipeOptions.$options;
        req.currentString = req.currentString.replace(args[0],args[1]);
        next();
    }
,   'append':function(req,res,next){
		if(!req.currentString){return next();}
        var args = req.urlPipeOptions.$options;
        if(!args.length){return next();}
        req.currentString = req.currentString+args[0];
        next();
    }
};

var dynamicRouter = urlPipe('options',dynamicRoutes);

app.use('/:string/:options(*)?',
    function(req,res,next){
        var str = req.param('string');
        if(str){req.currentString=str;}
        next();
    }
,   dynamicRouter
);

app.use(function(req,res) {
	if(req.currentString){
		return res.status(200).send(req.currentString);
	}
	res.status(200).send('use the address bar to input a string');	
});

app.listen(3000);
console.log('Connect-Url-Pipe test is listening on port 3000');