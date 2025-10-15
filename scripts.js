let generationTextHeader=`#\tthis text was generated using endless-sky-generator on github\n`
function scriptVanillaOutfitter(){
	let outfitNames=nodes
		.filter(node=>node.line.startsWith(`outfit `)) // select only nodes that define outfits
		.map(outfit=>outfit.line.slice(7)) // extract outfit name by removing the node key
		.sort()
	copyToClipboard(`${generationTextHeader}outfitter "cheater: everything"\n\t${outfitNames.join(`\n\t`)}`) // copy formatted outfitter block to clipboard
}
function scriptVanillaShipyard(){
	let shipNames=nodes
		.filter(node=>node.line.startsWith(`ship `)) // select only nodes that define ships
		.map(ship=>ship.line.match(/(['"`])(?:\\.|(?!\1).)*?\1/g)?.at(-1)) // extract only the last quoted ship name from the line, to account for variant ships
		.sort()
	copyToClipboard(`${generationTextHeader}shipyard "cheater: everything"\n\t${shipNames.join(`\n\t`)}`) // copy formatted shipyard block to clipboard
}
function scriptVanillaRevealSystems(){
	let systemNames=nodes
		.filter(node=>node.line.startsWith(`system `)) // select only nodes that define systems
		.map(system=>system.line.slice(7)) // extract system name by removing the node key
		.sort()
	copyToClipboard(`${generationTextHeader}event "cheater: reveal vanilla systems"\n\tvisit ${systemNames.join(`\n\tvisit `)}`) // copy formatted event block that marks all vanilla systems as visited to clipboard
}
let nodes=[]
function parseLinesToTree(){
	nodes=[]
	let stack=[{children:nodes,indent:-1}] // initialize stack with virtual root nodes for hierarchy tracking
	for(let fileText of dataFiles){
		let lines=fileText
			.replace(/#.*$/gm,``) // remove comments since Endless Sky uses `#` for comment lines
			.split(/\n/) // split text into lines to process sequentially
		for(let line of lines){
			if(!line.trim())continue // skip empty or whitespace-only lines since they hold no data
			let indent=line.match(/^\t*/)[0].length // count leading tabs to determine indentation depth
			let node={line:line.trim(),children:[]} // create a node object with line content and empty children array
			let closestStack=stack[stack.length-1] // cache most recently stacked node to reduce operations
			while(stack.length&&closestStack.indent>=indent){
				stack.pop() // remove the most recently stacked node since its indent is too deep to be the parent of the current line
				closestStack=stack[stack.length-1] // update reference to the new top of the stack to find the correct parent
			} // ensure the stack's top node has an indent smaller than the current line so we attach the node to the correct parent
			closestStack.children.push(node) // attach current node to the most recent valid parent
			stack.push({...node,indent}) // push current node onto stack with its indent level to track nesting
		}
	}
	return nodes
}
let dataFiles=[]
function importData(){
	let input=document.createElement(`input`)
	input.type=`file`
	input.webkitdirectory=true
	input.multiple=true
	input.style.display=`none`
	input.onchange=async event=>{
		dataFiles=[]
		for(let file of event.target.files){
			try{
				if(!file.name.endsWith(`.txt`)){continue}
				dataFiles.push(await file.text())
			}catch{}
		}
		parseLinesToTree()
		document.querySelectorAll(`.category-content`).forEach(element=>element.classList.remove(`blocked`))
	}
	document.body.appendChild(input)
	input.click()
	document.body.removeChild(input)
}
function copyToClipboard(textToCopy){
	try{
		navigator.clipboard.writeText(textToCopy)
		alert(`Text copied to clipboard.`)
	}catch(error){
		alert('Failed to copy text: ',error)
	}
}