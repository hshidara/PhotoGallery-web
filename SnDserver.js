/*
 * SERVER VARS
 */
var static 	= require('node-static');
var http 	= require('http');
http.globalAgent.maxSockets = 1;

var server 	= http.createServer(handler);
var sqlite3 = require("sqlite3").verbose();  // use sqlite

/*
 * IMAGE VARS
 */

var fs = require('fs');  // file access module
//var imgList = [];

//loadImageList();
/*
 * SERVER FUNCTIONS
 */

function handler(request,response){
	let file = new static.Server('./public');
	let url = request.url;
	
	url = url.replace("/","");
	
	if(is_multiple_queries(url)){
		let idStr = parseFloat(url.split("=")[1]);
		console.log(url,url.split("="),idStr);
		let idLst = idStr.split("+");

	        if(request_is_query(url) && ids_are_in_range(idLst)){
                        getImagesFromDB(response,idLst,writeResCB);
                }
                else{
                        response.writeHead(400, {"Content-Type": "text/plain"});
                        response.write("Bad Request\n");
                        response.end();
                }
	}	
	else{
		console.log("single query")
		let n = parseFloat(url.split("=")[1]);
		let idLst = [];	
		if(request_is_query(url) && n>0 && n<990){
			
			idLst.push(n);
               		getImagesFromDB(response,idLst,writeResCB);
        	}
        	else if (n<0 || n>=990){
                	response.writeHead(400, {"Content-Type": "text/plain"});
                	response.write("Bad Request\n");
                	response.end();
        	}
	}
			
    	request.addListener('end', function () {
        		file.serve(request, response).addListener('error', function (err) {
//				if(err) file.serveFile('/not_found.html', 404, {}, request, response);
			});
		
    	}).resume();
}

/*
 * IMAGE CODE
 */
function getImagesFromDB(res,lst,callback){

	var db = new sqlite3.Database("PhotoQ.db");
	let dLst = [];
	lst.forEach(function(n){
		
  		db.all ( 'SELECT * FROM photoTags WHERE id IN ('+n+')', dataCallback);
      		function dataCallback( err, data ) {
			dLst = dLst.concat(data[0]);
                	console.log(data);
			if(dLst.length == lst.length) callback(res,dLst);
      		}
		
	});
	db.close();
}

function writeResCB(response,d){	
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(JSON.stringify(d));
	response.end();
}

/*
function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
	    console.log("cannot read photoList.json");
    } else {
	    listObj = JSON.parse(data);
	    imgList = listObj.photoURLs;
    }
}
*/
/* 
 * CONDITIONALS
 */

function request_is_query(url){
	return url.split("?")[0] == "query";
} 

function ids_are_in_range(lst){
	lst.forEach(function(l){
		if(n<=0 && n>990) return false;
	});
	return true;
}

function is_multiple_queries(url){
	return url.includes("query?numList");
}

function query_is_valid(url){
	const query = url.split("=");
	const img_num = +query[1];
	console.log(img_num);
	if(img_num > 0 && img_num < 990) return true;
	return false;
}

server.listen(57987);
