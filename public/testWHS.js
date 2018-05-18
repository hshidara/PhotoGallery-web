// Global; will be replaced by a call to the server!
var photoURLArray =
[
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/A%20Torre%20Manuelina.jpg"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Uluru%20sunset1141.jpg" },
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Sejong tomb 1.jpg"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Serra%20da%20Capivara%20-%20Painting%207.JPG"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"},
 { url: "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Red%20pencil%20urchin%20-%20Papahnaumokukea.jpg"}
 ];


// Called when the user pushes the "submit" button
function photoByNumber() {

	var num = document.getElementById("num").value;
	num = num.trim();
	var photoNum = Number(num);
	if (photoNum != NaN) {
/* 		var photoURL = photoURLArray[photoNum].url;
		var display = document.getElementById("photoImg");
		display.src = photoURL;
*/
		var oReq = new XMLHttpRequest();
		var url = "query?num="+num;
		oReq.open("GET",url);
		oReq.addEventListener("load", reqListener); 
		oReq.send(); 
	}

	function reqListener(){
		var photoURL = this.responseText;
		var display = document.getElementById("photoDisplay");
		
		if(document.getElementById("url_text_container")) document.getElementById("url_text_container").remove();

		var textContainer = document.createElement("div");
		textContainer.id = "url_text_container";
		var text = document.createTextNode("Source: http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO @ "+photoURL);
		
		textContainer.appendChild(text);
		display.append(textContainer);
		var img = document.getElementById("photoImg");
                img.src = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + String(photoURL);
	}
	
}
