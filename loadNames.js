let url 	= require('url');
let sizeOf 	= require('image-size');
let http 	= require("http");
let sqlite3 	= require("sqlite3").verbose();  // use sqlite
let fs 		= require("fs");
let APIrequest  = require('request');

let db 		= new sqlite3.Database("PhotoQ.db");
let ct 		= 0, numPhotos = 0, imgList = [], tags_ct = 0;

http.globalAgent.maxSockets = 1;

loadImageList();
//getImgAnnotations();

function loadImageList () {
    var data = fs.readFileSync('photoList.json');
//    var data = fs.readFileSync('photo_test.json');
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
			fileName:encodeURIComponent(img.replace("ADD_KEY_HERE","")),
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
	//	db.close();
		dumpDB();
		getImgAnnotations(tags_ct);
	} 
}

function tagsDbCB(){ // callback every time an insert finishes
        tags_ct++;
	if(tags_ct == 490){
		setTimeout(function(){ getImgAnnotations(tags_ct); }, 60000);
	}
	else{
		getImgAnnotations(tags_ct);
	}
	if (tags_ct == numPhotos){
                console.log("closing DB");
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

/*
 * FINAL PROJECT PART API REQUEST FOR TAGS
 */

function getImgAnnotations(n){
	// An object containing the data the CCV API wants
	// Will get stringified and put into the body of an HTTP request, below

	const APIrequestObject = {
	  "requests": [
	    {
	      "image": {
		"source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + encodeURIComponent(imgList[n])}
		},
	      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
	    }
	  ]
	};

        annotateImage(APIrequestObject,encodeURIComponent(imgList[n]),n);

/*
	imgList.forEach(function(img,i){
		const APIrequestObject = {
		  "requests": [
		    {
		      "image": {
			"source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + encodeURIComponent(img)}
			},
		      "features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
		    }
		  ]
		};
		setTimeout(function(){ annotateImage(APIrequestObject,encodeURIComponent(img),i); }, 500);

	        //annotateImage(APIrequestObject,encodeURIComponent(img),i);
	});
*/
}

// URL containing the API key 
// You'll have to fill in the one you got from Google

// function to send off request to the API
function annotateImage(d,img,i) {
	// The code that makes a request to the API
	// Uses the Node request module, which packs up and sends off 
	// an HTTP message containing the request to the API server
	APIrequest(
	    { // HTTP header stuff
		url: 'https://vision.googleapis.com/v1/images:annotate?key=ADD_KEY_HERE',
		method: "POST",
		headers: {"content-type": "application/json"},
		// will turn the given object into JSON
		json: d
	    },
	    // callback function for API request
	    APIcallback
	);


	// callback function, called when data is received from API
	function APIcallback(err, APIresponse, body) {
    	    if ((err) || (APIresponse.statusCode != 200)) {
		console.log("Got API error");
		console.log(body);
    	    } else {
		APIresponseJSON = body.responses[0];
//		if(APIresponseJSON.landmarkAnnotations) console.log(APIresponseJSON.landmarkAnnotations);
		console.log(i);
		add_annotations_2_DB(d,APIresponseJSON,img,i);		
	    }		
    	} // end callback function

} // end annotateImage

function add_annotations_2_DB(d,res,img,id){
	let cmdStr = "";
	let tags_lst = [], landmarks_lst = [];
	if(res.labelAnnotations){
		res.labelAnnotations.forEach(function(label){
			tags_lst.push(label.description);
		});
	}
	if(res.landmarkAnnotations){
		res.landmarkAnnotations.forEach(function(label){
                	landmarks_lst.push(label.description);
        	});	
		cmdStr = "UPDATE photoTags SET location="+'"'+landmarks_lst[0]+'"'+", tags="+'"'+tags_lst.slice(1,7)+'"'+" WHERE id = "+id+";"; 
	}
	else{ 
		cmdStr = "UPDATE photoTags SET tags="+'"'+tags_lst.slice(1,7)+'"'+" WHERE id = "+id+";";
	}
       	if(cmdStr != ""){
		db.run(cmdStr,tagsDbCB);
	}
	else{
		tags_ct++;
	}
}
	
