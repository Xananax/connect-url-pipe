var define = function(obj,name,val){
	Object.defineProperty(obj,name,{enumerable: false,writable: true,value:val});
}

var makeGetOpts = function(optionsParam,optionsDelimiter,optionsArgumentsDelimiter){
	var replacer = new RegExp('^'+optionsDelimiter+'|'+optionsDelimiter+'$')
	return function DynamicMiddleWareOptionsParser(req){
		var opts = req.param(optionsParam);
		if(opts){
			opts = opts.replace(replacer,'');
			opts = opts.split(optionsDelimiter);
			var optionName,optionVal,o={},i=0,l=opts.length;
			for(i;i<l;i++){
				opts[i] = opts[i].split(optionsArgumentsDelimiter);
				optionName = opts[i].shift();
				optionVal = (opts[i].length>=1) ? opts[i] : [];
				o[optionName] = optionVal;
				define(o,i,optionName);
			}
			define(o,'length',l);
			define(o,'$current',o[0]);
			define(o,'$index',0);
			return o;
		}
		return false;
	};
}

var makeRoute = function(routes,optionsParser){

	return function DynamicMiddlewareRoute(req,res,next){
		var opts = optionsParser(req);
		if(!opts || !opts.length){return next();}
		req.urlPipeOptions = opts;
		var errs = opts.$errors = [];
		function DynamicMiddlewareNextOption(i,err){
			if(err){errs.push(err);}
			if(i>=opts.length){
				return errs.length ? next(err[0]):next();
			}
			var moduleName = opts[i];
			opts.$current = moduleName;
			opts.$options = opts[moduleName];
			opts.$index = i;
			if(!routes[moduleName]){
				return DynamicMiddlewareNextOption(i+1,new Error('no dynamic middleware named '+moduleName+' was found'));
			}
			routes[moduleName](req,res,DynamicMiddlewareNextOption.bind(null,i+1));
		}
		DynamicMiddlewareNextOption(0);
	}

}

var DynamicMiddleware = function(optionsParam,routes,optionsDelimiter,optionsArgumentsDelimiter){

	if(!optionsParam){throw new Error('you must provide a named parameter for options')}
	if(!routes){throw new Error('no routes provided');}
	if(!optionsDelimiter){optionsDelimiter='/';}
	if(!optionsArgumentsDelimiter){optionsArgumentsDelimiter=':';}

	var getOpts = makeGetOpts(optionsParam,optionsDelimiter,optionsArgumentsDelimiter);
	var route = makeRoute(routes,getOpts);
	return route;

}

module.exports = DynamicMiddleware;