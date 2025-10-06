function setScripts(category){
	for(let element of document.getElementsByClassName(`category`)){
		element.classList.remove(`hovered`)
	}
	for(let element of document.getElementsByClassName(`category-content`)){
		element.style.display=`none`
	}
	try{
		document.getElementById(category.innerText).style.display=`flex`
		category.classList.add(`hovered`)
	}catch{}
}