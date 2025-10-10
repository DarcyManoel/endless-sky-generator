function setScripts(category){
	for(let element of document.getElementsByClassName(`category`)){
		element.classList.remove(`hovered`)
	}
	for(let element of document.getElementsByClassName(`category-content`)){
		element.style.display=`none`
	}
	try{
		document.getElementById(category.innerText).style.display=`initial`
		category.classList.add(`hovered`)
	}catch{}
}
let generationTextHeader=`#\tthis text was generated using endless-sky-generator on github\n`
async function scriptVanillaOutfitter(){
	let outfits=[]
	try{
		for(let file of Object.values(dataFiles)){
			let outfitLines=file
				.split(`\n`)
				.filter(line=>line.startsWith(`outfit `))
			outfits.push(...outfitLines
				.map(outfit=>outfit.replace(`outfit `,``))
			)
		}
		await copyToClipboard(`${generationTextHeader}outfitter "cheater: everything"\n\t${outfits.sort().join(`\n\t`)}`)
	}catch(error){
		alert(`Error: ${error.message||error}`)
	}
}
async function scriptVanillaShipyard(){
	let ships=[]
	try{
		for(let file of Object.values(dataFiles)){
			let regex=/^ship\s+((["'`]).+?\2|[^\s]+)(?:\s+((["'`]).+?\4|[^\s]+))?$/
			file.split(`\n`).forEach(function(line){
				if(!line.startsWith(`ship `)){return}
				let match=line.match(regex)
				if(match){
					ships.push(match[3]||match[1])
				}
			})
		}
		await copyToClipboard(`${generationTextHeader}shipyard "cheater: everything"\n\t${ships.sort().join(`\n\t`)}`)
	}catch(error){
		alert(`Error: ${error.message||error}`)
	}
}
async function scriptVanillaRevealSystems(){
	let systems=[]
	try{
		for(let file of Object.values(dataFiles)){
			systems.push(...file
				.split(`\n`)
				.filter(line=>line.startsWith(`system `))
				.map(line=>line.replace(`system `,``))
			)
		}
		await copyToClipboard(`${generationTextHeader}event "cheater: reveal vanilla systems"\n\tvisit ${systems.sort().join(`\n\tvisit `)}`)
	}catch(error){
		alert(`Error: ${error.message||error}`)
	}
}
let dataFiles=[]
function importData(){
	let input=document.createElement(`input`)
	input.type=`file`
	input.webkitdirectory=true
	input.multiple=true
	input.style.display=`none`
	input.onchange=async event=>{
		for(let file of event.target.files){
			try{
				if(!file.name.endsWith(`.txt`)){continue}
				dataFiles.push(await file.text())
			}catch{}
		}
		console.log(dataFiles)
	}
	document.body.appendChild(input)
	input.click()
	document.body.removeChild(input)
}
async function updateVanillaData(){
	dataFiles=[]
	try{
		let files=await getEndlessSkyData()
		for(let file of files){
			dataFiles.push(file.text)
		}
	}catch{
		alert(`Failed to fetch vanilla data. Your Github API fetching limit has been exceeded, try again later.`)
	}
}
async function getEndlessSkyData(){
	let url=`https://api.github.com/repos/endless-sky/endless-sky/contents/data`
	async function recurse(path=``){
		let response=await fetch(`${url}/${path}`)
		if(!response.ok){
			return
		}
		let items=await response.json()
		let files=items
			.filter(item=>item.type===`file`&&item.name.endsWith(`.txt`))
		let directories=items
			.filter(item=>item.type===`dir`)
			.map(directory=>recurse(directory.path.replace(/^data\//,``)))
		let texts=files
			.map(async file=>{
				let textResponse=await fetch(file.download_url)
				if(!textResponse.ok){
					throw new Error(`Download failed: ${file.name}`)
				}
				let text=await textResponse.text()
				return{path:file.path,text}
			})
		let results=await Promise.all([...texts,...directories])
		return results.flat()
	}
	return recurse()
}
async function copyToClipboard(textToCopy){
	try{
		await navigator.clipboard.writeText(textToCopy)
		alert(`Text copied to clipboard.`)
	}catch(error){
		alert('Failed to copy text: ',error)
	}
}