
// Called when the user pushes the "submit" button
function photoByNumber() {

	var input = document.getElementById("num").value.trim();

	if (input_is_valid(input)) {
		var oReq = new XMLHttpRequest();

			
		const url = userInput2Query(input);
		console.log(url);
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

function input_is_valid(in){
	return true;
}

function userInput2Query(str){
	if(str.split(",").length > 1){
		return "query?numList=" + str.replace(",","+");
	}
	else return "query?num=" + str;
}
