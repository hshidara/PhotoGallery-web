/*  Module to create tagTable 

Include in your code with:

var auto = require("./makeTagTable");

Call as: 

var tagTable = {};   // global
auto.makeTagTable(tagTableCallback);
function tagTableCallback(data) {
   tagTable = data;
}

*/

// global variables
var fs = require('fs');  // file access
var sqlite3 = require("sqlite3").verbose();
var dbFileName = "PhotoQ.db";
var db = new sqlite3.Database(dbFileName);
var accents = require("remove-accents");

// the tagTable object
var tagTable = {};

function makeTagTable(callback) {
    const cmd = 'SELECT tags, location FROM photoTags';
    db.all(cmd, processTags);

    // database callback
    function processTags(err, data) {
	if (err) {
	    console.log(err)
	} else {
	    var tags, landmark;
	    for (let i=0; i<data.length; i++) {
		landmark = data[i].landmark;
		insert(landmark, tagTable);
		tags = data[i].tags;
		let tagList = tags.split(", ");
		tagList.map(function (tag) { tag.trim(); });
		for (let j=0; j<tagList.length; j++) {
		    insert(tagList[j],tagTable);
		}
	    }
	    alphabetize();
	    dumpToFile();
	    callback(tagTable);
	}
    }
}


function insert(tag, table) {
    if ((tag != "") && (tag != undefined)) {

	var cleanTag = accents.remove(tag);
	var tagKey = cleanTag.substr(0,2);
	tagKey = tagKey.toLowerCase();
	
	if (table.hasOwnProperty(tagKey)) {
	    let oldObj = table[tagKey];
	    if (oldObj.tags.hasOwnProperty(tag)) {
		oldObj.tags[tag] += 1;
	    } else {
		oldObj.tags[tag] = 1;
	    }
	    table[tagKey] = oldObj; 
	} else {
	    var newObj = { tags: {} };
	    newObj.tags[tag] = 1;
	    table[tagKey] = newObj;
	}
    }
}

function alphabetize() {

    var ordered = {};
    var keys = Object.keys(tagTable);
    console.log(keys.length," keys");
    keys.sort();
    keys.forEach( function(key) {
	ordered[key] = tagTable[key];
    });
    tagTable = ordered;
}


function dumpToFile() {
    fs.writeFile("xxx.json", JSON.stringify(tagTable), function(err) {
	if(err) {
	    return console.log(err);
	}
	console.log("The file was saved!");
    }); 
}

// function visible from outside when required as module
exports.makeTagTable = makeTagTable;
exports.tagTable = tagTable;


