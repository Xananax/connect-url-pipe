# Connect-Url-Pipe
==================

Middleware for connect or express that allows for dynamic routing.
Useful if in your app,  `/book/author` and `author/book` are equivalent, or if you intend to have something like `:string/toLowerCase/replace:a:b/append:!/`

## Usage

install:
```sh
npm install connect-url-pipe
```

```js
var app = require('express')()
var urlPipe = require('connect-url-pipe');

var dynamicRoutes = {
    'toLowerCase':function(req,res,next){
        req.currentString = req.currentString.toLowerCase();
        next();
    }
,   'replace':function(req,res,next){
        var args = req.urlPipeOptions.$options;
        req.currentString = req.currentString.replace(args[0],args[1]);
        next();
    }
,   'append':function(req,res,next){
        var args = req.urlPipeOptions.$options;
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
,   function(req,res,next){
        res.send(req.currentString);
    }
)

//http://localhost:3000/ABCDE/append:! -> ABCDE!
//http://localhost:3000/ABCDE/append:!/toLowerCase -> abcde!
//http://localhost:3000/ABCDE/replace:a:b/toLowerCase -> abcde
//http://localhost:3000/ABCDE/toLowerCase/replace:a:b -> bbcde

```



Connect-Url-Pipe adds an array-like object to req called `urlPipeOptions`.  
For the `dynamicRoutes` above, `req.urlPipeOptions` will be:
```js
{
    'toLowerCase':[function]
,   0:[function toLowerCase]
,   'replace':[function]
,   1: [function Replace]
,   'append':[function]
,   2: [function append]
,   'length':3
,   '$current':'toLowerCase'
,   '$index':0
,   '$options':null
}
```

Only the function names are enumerable, the numeric indices, `length`,`$current` and `$index` are not.

- `$current` gives you the name of the current route
- `$index` gives you the index of the current route (useful if you want to know if it's loaded before or after another module)
- `$options` gives you the URL options provided.

-------

## Syntax

The default syntax is:  
`modulename[:arg[:arg]]/modulename...`

But you can modify it by setting them in the constructor:

```js
var dynamicRouter = urlPipe('options',dynamicRoutes,'/':':');
```

`options` is the name of the param to use. It depends on how you set up your url; since in our example, the url is `/:string/:options(*)?`, we use `options`.

----

## Tests
No unit tests, but you can try the software by:
```
cd test
npm install express
node index.js
```
And going to http://localhost:3000

----

## License
MIT