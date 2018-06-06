/*
 * SERVER VARS
 */
var static 	= require('node-static');
var http 	= require('http');
http.globalAgent.maxSockets = 1;

var server 	= http.createServer(handler);
var sqlite3 = require("sqlite3").verbose();  // use sqlite
var auto = require("./makeTagTable");

/*
 * IMAGE VARS
 */

var fs = require('fs');  // file access module

var tagTable = {};   // global

/*
 * SERVER FUNCTIONS
 */

function handler(request,response){
	let file = new static.Server('./public');
	let url = request.url;
	
	url = url.replace("/","");
	
	if(is_multiple_queries(url)){
		let idStr = url.split("=")[1];
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
	else if(is_key_list_query(url)){
	        let idStr = url.split("=")[1];
                let idLst = idStr.split("+");
		getImgsFromKeys(response,idLst,writeResCB);
	}
	else if(is_autocomplete_query(url)){
		console.log("is autocomplete");
		auto.makeTagTable(tagTableCallback);
		function tagTableCallback(data) {
        		tagTable = data;
			writeResCB(response,data);
        		console.log(data);
		}
	}
	else{
		console.log("single query")
		let n = parseFloat(url.split("=")[1]);
		let idLst = [];	
		if(request_is_query(url) && n>0 && n<989){
			
			idLst.push(n);
               		getImagesFromDB(response,idLst,writeResCB);
        	}
        	else if (n<0 || n>988){
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

function getImgsFromKeys(res,lst,callback){
	let db = new sqlite3.Database("PhotoQ.db");
	let cmdStr = "SELECT * FROM photoTags WHERE ";
	lst.forEach(function(key,i){
		key = decodeURIComponent(key);
		if((/[^a-z ]/.test(key))){
			cmdStr = cmdStr;
		} 
		else if(i == 0) cmdStr = cmdStr+"(location = "+'"'+key+'"'+" OR tags LIKE "+'"'+"%"+key+"%"+'"'+") ";
		else{
			cmdStr = cmdStr+"AND (location = "+'"'+key+'"'+" OR tags LIKE "+'"'+"%"+key+"%"+'"'+")";
		}
	});
	console.log(cmdStr);
//	cmdStr = 'SELECT * FROM photoTags'; 
//	db.all('SELECT * FROM photoTags',dataCallback);
        db.all(cmdStr,dataCallback);
	function dataCallback( err, data ) {
		console.log(data);
		let res_obj;
		if(data && data.length > 0) res_obj = { "data": data, "message":"These are all of the photos satisfying this query."};
		else res_obj = { "message":"These were no photos satisfying this query"};
		callback(res,res_obj);
	}
	
	db.close();
}

function writeResCB(response,d){	
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(JSON.stringify(d));
	response.end();
}

/* 
 * CONDITIONALS
 */

function request_is_query(url){
	return url.split("?")[0] == "query";
} 

function ids_are_in_range(lst){
	lst.forEach(function(l){
		if(l<=0 && l>989) return false;
	});
	return true;
}

function is_multiple_queries(url){
	return url.includes("query?numList");
}

function is_key_list_query(url){
	return url.includes("query?keyList=");
}

function is_autocomplete_query(url){
	return url.includes("query?autocomplete=");
}

function query_is_valid(url){
	const query = url.split("=");
	const img_num = +query[1];
	console.log(img_num);
	if(img_num > 0 && img_num < 990) return true;
	return false;
}

server.listen(57987);
