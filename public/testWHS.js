let photos = [];
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
		const placeholder = document.getElementById("placeholder");
        	placeholder.style.display = "none";
		const reactContainer = document.getElementById("react");
		photos = setPhotos(photoURL);
		ReactDOM.render(React.createElement(App),reactContainer);
	}
	
}

function input_is_valid(input){
	return true;
}

function userInput2Query(str){
	if(str.split(",").length > 1){
		return "query?numList=" + str.replace(/,/g, "+");
	}
	else return "query?num=" + str;
}


function setPhotos(str){
	const imgLst = JSON.parse(str);
	
	imgLst.map(function(img){
		img.src =  "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + String(img.fileName);	
	});
	console.log(imgLst);
	return imgLst;
}

function onInputChange(input){
	console.log(input);
	let autocomplete_lst = {};
	if(input.length >= 2){
		
		let oReq = new XMLHttpRequest();

                const url = "query?autocomplete="+input;
                console.log(url);
                oReq.open("GET",url);
                oReq.addEventListener("load", reqListener);
                oReq.send();

		if(input.length > 2){
			return;	
		}
	}
	
	function reqListener(){
		const tagArray = this.responseText;
		autocomplete_lst = tagArray[input]["tags"];
		const strs

	//	var strs = [ "String 1", "String 2", "String 3" ];
		var list = document.createElement("ul");
		for (var i in strs) {
		  var anchor = document.createElement("a");
		  anchor.href = "#";
		  anchor.innerText = strs[i];

		  var elem = document.createElement("li");
		  elem.appendChild(anchor);
		  list.appendChild(elem);
		}				
	}
}

/*
 * AUTOCOMPLETE
 */



/*
 * REACT COMPONENT
 */

// A react component for a tag
class Tag extends React.Component {

    render () {
	 return React.createElement('p', // type
	 	{ className: 'tagText',
	 		onClick: () => alert("Tag [" + this.props.text + "] from image [" + this.props.parentImage + "] was clicked!")
	 	}, // properties
		this.props.text); 
    }
};

// A react component for controls on an image tile
class TileControl extends React.Component {

    render () {
        // remember input vars in closure
        var _selected = this.props.selected;
        var _src = this.props.src;
	var photoNames = this.props.tags.split(",");	
        // parse image src for photo name
        var photoName = _src.split("/").pop();
        photoName = photoName.split('%20').join(' ');
	
//	this.state = {tagArray:this.props.tags};
	this.state = {tagEls: []};	
	//let tagEls = [];


       	 var args = [];
	 args.push( 'div' );

	 args.push( { className: _selected ? 'selectedControls' : 'normalControls'} )

	 for(let idx = 0; idx < photoNames.length; idx++)
		 args.push( React.createElement(Tag,
	 		{text: photoNames[idx], parentImage: _src}
	 ));
	 return ( React.createElement.apply(null, args) ); 
    } // render
};

// A react component for an image tile
class ImageTile extends React.Component {

    render() {
        // onClick function needs to remember these as a closure
        var _onClick = this.props.onClick;
        var _index = this.props.index;
        var _photo = this.props.photo;
        var _selected = _photo.selected; // this one is just for readability

        return (
            React.createElement('div',
                {style: {margin: this.props.margin, width: _photo.width},
                         className: 'tile',
                         onClick: function onClick(e) {
                            console.log("tile onclick");
                            // call Gallery's onclick
                            return _onClick (e,
                                             { index: _index, photo: _photo })
                                }
                 }, // end of props of div
                 // contents of div - the Controls and an Image
                React.createElement(TileControl,
                    {selected: _selected,
                     src: _photo.src,
		     tags:_photo.tags}),
                React.createElement('img',
                    {className: _selected ? 'selected' : 'normal',
                     src: _photo.src,
                     width: _photo.width,
                     height: _photo.height
                            })
                                )//createElement div
        ); // return
    } // render
} // class

// The react component for the whole image gallery
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: photos };
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
  }

  render() {
	if(window.innerWidth <= 480){
                return (
                        React.createElement( Gallery, {photos: photos,
                        onClick: this.selectTile,
                        ImageComponent: ImageTile,
                        columns:1
                        } )
                );	
	}
	else{
    		return (
       			React.createElement( Gallery, {photos: photos,
                   	onClick: this.selectTile,
                   	ImageComponent: ImageTile,
		   	columns:2	
			} )
            	);
  	}
  }

}

