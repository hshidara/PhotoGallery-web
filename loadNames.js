var url = require('url');
var sizeOf = require('image-size');

var http = require("http");
http.globalAgent.maxSockets = 1;

var sqlite3 = require("sqlite3").verbose();  // use sqlite
var fs = require("fs");

var db = new sqlite3.Database("PhotoQ.db");

let ct = 0, numPhotos = 0;

var imgList = [];

loadImageList();

function loadImageList () {
    var data = fs.readFileSync('photoList.json');
    if (! data) {
            console.log("cannot read photoList.json");
    } else {
            listObj = JSON.parse(data);
            imgList = listObj.photoURLs;
	    loadImg(imgList);				
    }
}

function loadImg(lst){
	numPhotos = lst.length;

	lst.forEach(function(img,i){
		let info = {
			id:i,
			fileName:encodeURIComponent(img.replace("http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/","")),
			height:0,
			width:0,
			location:"",
			tags:""
		};
		getSize(info,info.fileName,sizeCB);	
	});
}

function sizeCB(photo, width, height){
	insertIntoDB(photo,width,height,dbCB);
}

function insertIntoDB(img,w,h,dbCB){
	let cmdStr = ' INSERT OR REPLACE INTO photoTags VALUES ('+img.id+','+'"'+img.fileName+'"'+','+w+','+h+','+'"'+img.location+'"'+','+'"'+img.tags+'"'+') ';
	console.log(cmdStr);
	db.run(cmdStr,dbCB); 
}

function dbCB(){ // callback every time an insert finishes
	ct++;
	if (ct == numPhotos){
		db.close();
		dumpDB();
	} 
}
// Get size of one image, then call cbFun
function getSize(ind, name, cbFun) {
    let imgServerURL = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/";    
    var imgURL = imgServerURL+name;
    var options = url.parse(imgURL);
    // call http get 
    http.get(options, function (response) {
	var chunks = [];
	response.on('data', function (chunk) {
	    chunks.push(chunk);
	}).on('end', function() {
	    var buffer = Buffer.concat(chunks);
	    dimensions = sizeOf(buffer);
		
	    cbFun(ind,dimensions.width,dimensions.height,cbFun);
	})
    })
}

function dbCallback(err) {
	if (err) { console.log(err); }
} 

function dumpDB() {
  db.all ( 'SELECT * FROM photoTags', dataCallback);
      function dataCallback( err, data ) {
		console.log(data) 
      }
}
