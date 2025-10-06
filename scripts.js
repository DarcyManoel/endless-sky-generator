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
		await updateVanillaData()
		for(let file of Object.values(vanillaDataFiles)){
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
async function scriptVanillaShipyards(){
	let ships=[]
	let shipVariants=[]
	try{
		await updateVanillaData()
		for(let file of Object.values(vanillaDataFiles)){
			let regex=/^ship\s+((["'`]).+?\2|[^\s]+)(?:\s+((["'`]).+?\4|[^\s]+))?$/
			file.split(`\n`).forEach(function(line){
				if(!line.startsWith(`ship `)){return}
				let match=line.match(regex)
				if(match){
					if(match[3]){
						shipVariants.push(`${match[3]}`)
					}else{
						ships.push(match[1])
					}
				}
			})
		}
		await copyToClipboard(`${generationTextHeader}shipyard "cheater: everything base"\n\t${ships.sort().join(`\n\t`)}\nshipyard "cheater: everything variant"\n\t${shipVariants.sort().join(`\n\t`)}`)
	}catch(error){
		alert(`Error: ${error.message||error}`)
	}
}
async function scriptVanillaRevealSystems(){
	let systems=[]
	try{
		await updateVanillaData()
		for(let file of Object.values(vanillaDataFiles)){
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
let vanillaDataFiles={}
async function updateVanillaData(){
	vanillaDataFiles={}
	try{
		let files=await getEndlessSkyData()
		for(let file of files){
			vanillaDataFiles[file.path.split(`/`).pop()]=file.text
		}
	}catch(error){
		throw new Error(`Failed to update vanilla data`)
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