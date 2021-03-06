//================== LOAD STATUS DISPLAY ==================//
function refreshCanvasSettings(TASK){
	// TODO: cleanup CANVAS; separate canvas ID from sequence logic; 'tsequence' variables coded by length rather than absolute time

	// Adjust length / toggle presence of gray screen between sample and test screens

	//---------------- SEQUENCE OF SAMPLE & TEST IMAGES ----------------//
	if (TASK.TestON <= 0){
		if (TASK.SampleOFF > 0){
			CANVAS.sequence = ["blank", "sample","blank","test"]
			CANVAS.tsequence = [0,100,100+TASK.SampleON,100+TASK.SampleON+TASK.SampleOFF]; 
		}
		else if (TASK.SampleOFF <= 0 ){
			CANVAS.sequence = ["blank","sample","test"]
			CANVAS.tsequence = [0,100,100+TASK.SampleON]; 
		}
	} //if Match-to-Sample
	else if (TASK.TestON > 0){
		if (TASK.SampleOFF > 0 && TASK.TestOFF > 0){
			CANVAS.sequence = ["blank","sample","blank","test","blank","choice"]
			CANVAS.tsequence = [0,100,100+TASK.SampleON,100+TASK.SampleON+TASK.SampleOFF,
								100+TASK.SampleON+TASK.SampleOFF+TASK.TestON,
								100+TASK.SampleON+TASK.SampleOFF+TASK.TestON+TASK.TestOFF]; 
		}
		else if (TASK.SampleOFF <= 0 && TASK.TestOFF > 0){
			CANVAS.sequence = ["blank","sample","test","blank","choice"]
			CANVAS.tsequence = [0,100,100+TASK.SampleON,
			100+TASK.SampleON+TASK.TestON,
			100+TASK.SampleON+TASK.TestON+TASK.TestOFF];
		}
		else if (TASK.SampleOFF > 0 && TASK.TestOFF <= 0){
			CANVAS.sequence = ["blank","sample","blank","test","choice"]
			CANVAS.tsequence = [0,100,100+TASK.SampleON,100+TASK.SampleON+TASK.SampleOFF,
								100+TASK.SampleON+TASK.SampleOFF+TASK.TestON]; 
		}
		if (TASK.SampleOFF <= 0 && TASK.TestOFF <= 0){
			CANVAS.sequence = ["blank","sample","test","choice"]
			CANVAS.tsequence = [0,100,100+TASK.SampleON,
								100+TASK.SampleON+TASK.TestON];
		}
	} //else if Same-Different
	//---------------- SEQUENCE OF SAMPLE & TEST IMAGES (end) ----------------//
	
	// Adjust length of reward screen based on reward amount 
	CANVAS.tsequencepost[2] = CANVAS.tsequencepost[1]+ENV.RewardDuration*1000;

	// Adjust location of CANVAS based on species-specific setup
	if (typeof(TASK.HeadsupDisplayFraction) != "undefined"){
		CANVAS.headsupfraction=TASK.HeadsupDisplayFraction
	} //IF headsupdisplayfraction specified
	else{
		if (TASK.Species == "macaque" || TASK.Species == "human"){
			CANVAS.headsupfraction=0;
		}
		else if (TASK.Species == "marmoset"){
			CANVAS.headsupfraction=1/3-0.06;
		}		
	}

	if (CANVAS.headsupfraction == 0){
		var textobj = document.getElementById("heads-up-text");
		textobj.innerHTML = ''
		var textobj = document.getElementById("heads-up-text-devices");
		textobj.innerHTML = ''
	}

}

function writeTextonBlankCanvas(textstr,x,y){
	var blank_canvasobj=CANVAS.obj.blank
	var visible_ctxt = blank_canvasobj.getContext('2d')
	visible_ctxt.textBaseline = "hanging"
	visible_ctxt.fillStyle = "white"
	visible_ctxt.font = "18px Verdana"
	visible_ctxt.fillText(textstr,x,y)
}

// function writeTextonBlankCanvas(textstr,x,y){
// 	if (ENV.OffscreenCanvasAvailable){
// 		var visible_ctxt = VISIBLECANVAS.getContext('bitmaprenderer')
// 	}
// 	else if (ENV.OffscreenCanvasAvailable == 0){
// 		var visible_ctxt = VISIBLECANVAS.getContext('2d')
// 	}
// 	visible_ctxt.textBaseline = "hanging"
// 	visible_ctxt.fillStyle = "white"
// 	visible_ctxt.font = "18px Verdana"
// 	visible_ctxt.fillText(textstr,x,y)
// }

function updateStatusText(text){
	var textobj = document.getElementById("heads-up-text");
	textobj.innerHTML = text
}
//================== CANVAS SETUP ==================//

function setupCanvasHeadsUp(){
	canvasobj=document.getElementById("canvas-heads-up");
	canvasobj.width=document.body.clientWidth;
	canvasobj.height=Math.round(document.body.clientHeight*CANVAS.headsupfraction);
	CANVAS.offsettop = canvasobj.height;
	if (CANVAS.headsupfraction == 0){
		canvasobj.style.display="none";

		//hide buttons for triggering pump
		document.querySelector("button[id=pump-flush]").style.display = "none" //if do style.visibility=hidden, element will still occupy space
		document.querySelector("button[id=pump-trigger]").style.display = "none" //if do style.visibility=hidden, element will still occupy space
	}
	else{
		canvasobj.style.display="block";

		//show buttons for triggering pump
		document.querySelector("button[id=pump-flush]").style.display = "block"
		document.querySelector("button[id=pump-flush]").style.visibility = "visible"
		document.querySelector("button[id=pump-trigger]").style.display = "block"
		document.querySelector("button[id=pump-trigger]").style.visibility = "visible"
		document.querySelector("button[id=connect-ble-scale]").style.display = "block"
		document.querySelector("button[id=connect-ble-scale]").style.visibility = "visible"

		document.querySelector("button[id=pump-flush]").addEventListener(
			'pointerup',function(){ event.preventDefault(); runPump("flush") },false)
		document.querySelector("button[id=pump-trigger]").addEventListener(
			'pointerup',function(){ event.preventDefault(); runPump("trigger") },false)
	}
	var context=canvasobj.getContext('2d');

	context.fillStyle="#202020";
	context.fillRect(0,0,canvasobj.width,canvasobj.height);
	canvasobj.addEventListener('touchstart',touchstart_listener,false);
}
function setupCanvas(canvasobj){
	// center in page
	canvasobj.style.top=CANVAS.offsettop + "px";
	canvasobj.style.left=CANVAS.offsetleft + "px";
	canvasobj.width=windowWidth - CANVAS.offsetleft;
	canvasobj.height=windowHeight - CANVAS.offsettop;
	canvasobj.style.margin="0 auto";
	canvasobj.style.display="block"; //visible

	setupCanvasListeners(canvasobj)
} 

function setupEyeTrackerCanvas(){
	//SETUP similar to visiblecanvas
	EYETRACKERCANVAS.style.top=VISIBLECANVAS.style.top//mimic VISIBLECANVAS
	EYETRACKERCANVAS.style.left=VISIBLECANVAS.style.left;//mimic VISIBLECANVAS
	EYETRACKERCANVAS.width=VISIBLECANVAS.width //mimic VISIBLECANVAS
	EYETRACKERCANVAS.height=VISIBLECANVAS.height//mimic VISIBLECANVAS

	EYETRACKERCANVAS.style.margin="0 auto";
	EYETRACKERCANVAS.style.display="visible";

	setupCanvasListeners(EYETRACKERCANVAS)
}

function setupCanvasListeners(canvasobj){
		// assign listeners
	canvasobj.addEventListener('touchstart',touchstart_listener,{capture: false,passive: false}); // handle touch & mouse behavior independently http://www.html5rocks.com/en/mobile/touchandmouse/
	canvasobj.addEventListener('touchmove',touchmove_listener,{passive: false}) // based on console suggestion: Consider marking event handler as 'passive' to make the page more responive. https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
	canvasobj.addEventListener('touchend',touchend_listener,{capture: false, passive:false});
	canvasobj.addEventListener('mousedown',touchstart_listener,{capture: false,passive: false}); // handle touch & mouse behavior independently http://www.html5rocks.com/en/mobile/touchandmouse/
	canvasobj.addEventListener('mousemove',touchmove_listener,{passive: false}) // based on console suggestion: Consider marking event handler as 'passive' to make the page more responive. https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
	canvasobj.addEventListener('mouseup',touchend_listener,{capture: false, passive:false});
}

// Sync: Adjust canvas for the device pixel ratio & browser backing store size
// from http://www.html5rocks.com/en/tutorials/canvas/hidpi/#disqus_thread
function scaleCanvasforHiDPI(canvasobj){
	if (ENV.DevicePixelRatio !== backingStoreRatio){
		context=canvasobj.getContext("2d");
		var oldWidth = canvasobj.width;
		var oldHeight = canvasobj.height;
		canvasobj.width = oldWidth/ENV.CanvasRatio;
		canvasobj.height = oldHeight/ENV.CanvasRatio;
		canvasobj.style.width = windowWidth - CANVAS.offsetleft + "px";
		canvasobj.style.height = windowHeight - CANVAS.offsettop + "px";
		canvasobj.style.margin="0 auto";
	} 
}

function updateHeadsUpDisplay(){
	var textobj = document.getElementById("heads-up-text");

	// Overall performance
	var ncorrect = 0;
	var nreward = 0;
	for (var i=0; i<=TRIAL.Response.length-1; i++){
		if (TRIAL.Response[i] == TRIAL.CorrectItem[i]){
			ncorrect = ncorrect + 1
			nreward = nreward + TRIAL.NReward[i]
		}
	}

	var pctcorrect = Math.round(100 * ncorrect / TRIAL.Response.length);

	// Task type
	var task1 = "";
	var task2 = "";
	if (TASK.RewardStage == 0){
		task1 = "Fixation";
	}
	else if (TASK.RewardStage == 1){
		task1 = TASK.TestGridIndex.length + "-way AFC:"
		task2 = TASK.SampleON + "ms, " + TASK.ImageBagsTest.length + "-categories in pool"
	}
	if (CANVAS.headsupfraction > 0){
		textobj.innerHTML = 
 		'User: ' + ENV.ResearcherDisplayName + ', ' + ENV.ResearcherEmail + "<br>"
		+ 'Agent: ' + ENV.Subject + ", <font color=green><b>" + pctcorrect 
		+ "%</b></font> " + "(" + ncorrect + " of " + TRIAL.Response.length + " trials)" 
		+ "<br>" + "NRewards=" + nreward + ", <font color=green><b>" 
		+ Math.round(TASK.RewardPer1000Trials*nreward/1000) 
		+ "mL</b></font> (" + Math.round(TASK.RewardPer1000Trials) 
		+ " mL per 1000)" + "<br> " 
		+ task1 + "<br>" + task2 + "<br>" + "<br>"
		+ "last trial @ " + CURRTRIAL.lastTrialCompleted.toLocaleTimeString("en-US") + "<br>"
		+ "last saved to firebase @ " + CURRTRIAL.lastFirebaseSave.toLocaleTimeString("en-US")
		// + "<br>" + "<br>" 
		// + "<font color=red><b>" + ble.statustext + port.statustext_connect + "<br></font>" 
		// + "<font color=green><b>" + port.statustext_sent + "<br></font>" 
		// + "<font color=blue><b>" + port.statustext_received + "<br></font>"
		// + "<font color=red><b>" + blescale.statustext_connect + "<br></font>" 		
		// + "<font color=blue><b>" + blescale.statustext_received + "<br></font>"

		if (FLAGS.RFIDGeneratorCreated == 1){
			textobj.innerHTML = textobj.innerHTML + "<br>"
			+ "<font color = red>" + "PAUSED: waiting for RFID read!!" + "<br></font>"
		}
		if (TASK.CheckRFID > 0 && port.connected == false){
			textobj.innerHTML = textobj.innerHTML + "<br>"
			+ "<font color = red>" + "WARNING: USB device not connected to check RFID!!" + "<br></font>"
		}
	}
	else if (CANVAS.headsupfraction == 0){
		textobj.innerHTML = '' //port.statustext_connect + blescale.statustext_connect
	}
	else if (isNaN(CANVAS.headsupfraction)){ //before task params load
	if (ENV.ScreenRatio == -1) {
		var firestoreRecordFound = "<font color = red> DEVICE RECORD NOT FOUND! </font>"
		var screenRatioMatchesDPR = ''
	}
	else {
		var firestoreRecordFound = "<font color = green> DEVICE RECORD FOUND </font>"
		if (ENV.ScreenRatio != ENV.DevicePixelRatio){
			var screenRatioMatchesDPR = 'Detected DevicePixelRatio <font color = red>DOES NOT match record </font>'
		}
		else {
			var screenRatioMatchesDPR = 'Detected DevicePixelRatio <font color = green>MATCHES record </font>'
		}
	}
		textobj.innerHTML = 
		'User: ' + ENV.ResearcherDisplayName + ', ' + ENV.ResearcherEmail
		+ "<br>" + "No trials performed"
		+ "<br>"
		+ "<br><b>" + firestoreRecordFound + " for " + ENV.DeviceName.toLowerCase() + "</b>"
		+ "<br>" + "Screen Size = " + ENV.ScreenSizeInches[2] + "in (" + ENV.ViewportPixels + "px; " + ENV.ScreenRatio + "x" + ")"
		+ "<br>" + screenRatioMatchesDPR
		+ "<br>"
		+ "<br>" + "Device brand,name,type: " + ENV.DeviceBrand + ", "  + "<u><font color = green>" + ENV.DeviceName + "</font></u>" + ", " + ENV.DeviceType
		+ "<br>" + "Screen: " + ENV.DeviceScreenWidth + "x" + ENV.DeviceScreenHeight + " pixels"
		+ "<br>" + "TouchScreen: " + ENV.DeviceTouchScreen
		+ "<br>" + "GPU: " + ENV.DeviceGPU
		+ "<br>" + "OS name,codename,ver: " + ENV.DeviceOSName + ", "  + "<u><font color = green>"+ ENV.DeviceOSCodeName + "</font></u>" + ", " + ENV.DeviceOSVersion
		+ "<br>" + "Browser: "  + "<u><font color = green>" + ENV.DeviceBrowserName + "</font></u>" + " v" + ENV.DeviceBrowserVersion
	}
}

function updateHeadsUpDisplayDevices(){
	var textobj = document.getElementById("heads-up-text-devices");
	if (CANVAS.headsupfraction > 0){
		textobj.innerHTML = "<font color=red><b>" + ble.statustext
		+ port.statustext_connect + "<br></font>" 
		+ "<font color=green><b>" + port.statustext_sent + "<br></font>" 
		+ "<font color=blue><b>" + port.statustext_received + "<br></font>"
		+ "<font color=red><b>" + blescale.statustext_connect + "<br></font>" 		
		+ "<font color=blue><b>" + blescale.statustext_received + "<br></font>"
	}
	else if (CANVAS.headsupfraction == 0){
		textobj.innerHTML = '' //port.statustext_connect + blescale.statustext_connect
	}
	else if (isNaN(CANVAS.headsupfraction)){
		//before task params load
		textobj.innerHTML =  port.statustext_connect + blescale.statustext_connect
	}
}

function updateHeadsUpDisplayAutomator(currentautomatorstagename,pctcorrect,ntrials,minpctcorrect,mintrials,eventstring){
	var textobj = document.getElementById("heads-up-text-automator");
	if (CANVAS.headsupfraction > 0){
		textobj.innerHTML =
			"Automator: " + 
			"<font color=red><b>" + TASK.Automator + "</b></font> " +
			" " + "<font color=white><b>" +
			 "Stage" + TASK.CurrentAutomatorStage + "=" +
				currentautomatorstagename +
			"</b></font>" +"<br>" +
			"Performance: " + 
			"<font color=green><b>" + Math.round(pctcorrect) + "%, last " + 
			ntrials + " trials</b></font> " + 
			"(min: " + minpctcorrect + 
				"%, " + mintrials + " trials)" + "<br>" + "<br>" +
			eventstring
	}
	else if (CANVAS.headsupfraction == 0){
		textobj.innerHTML = ""
	}
}


//================== IMAGE RENDERING ==================//
// Sync: buffer trial images

function defineImageGrid(ngridpoints, gridspacing){
	var xgrid =[]
	var ygrid =[]
	var xgridcent =[] 
	var ygridcent =[]
	var cnt=0;
	for (var i=1; i<=ngridpoints; i++){
		for (var j=1; j<=ngridpoints; j++){
			xgrid[cnt]=i - 1/2;
			ygrid[cnt]=j - 1/2;
			cnt++;
		}
	}

	//center x & y grid within canvas
	var xcanvascent = (document.body.clientWidth - CANVAS.offsetleft)*ENV.CanvasRatio*ENV.DevicePixelRatio/2
	var dx = xcanvascent - gridspacing*ngridpoints/2; //left side of grid
	var ycanvascent = (document.body.clientHeight - CANVAS.offsettop)*ENV.CanvasRatio*ENV.DevicePixelRatio/2
	var dy = ycanvascent - gridspacing*ngridpoints/2; //top of grid
	for (var i=0; i<=xgrid.length-1; i++){
		xgridcent[i]=Math.round(xgrid[i]*gridspacing + dx);
		ygridcent[i]=Math.round(ygrid[i]*gridspacing + dy);
	}

	return [xcanvascent, ycanvascent, xgridcent, ygridcent]
}

//========== BUFFER SAMPLE CANVAS ==========//
async function bufferSampleImage(sample_image, sample_image_grid_index,canvasobj){
 console.time('startrenderSAMPLE')
	var context=canvasobj.getContext('2d'); 
	if (typeof(sample_image) !="undefined"){
	await renderImageOnCanvas(sample_image, sample_image_grid_index, ENV.SampleScale, canvasobj)
	}
 console.timeEnd('startrenderSAMPLE')
}


//========== BUFFER TEST CANVAS ==========//
async function bufferTestImages(sample_image, sample_image_grid_index, test_images, test_image_grid_indices, correct_index,canvasobj){
 console.time('startrenderTEST')
	// Option: draw sample (TODO: remove the blink between sample screen and test screen)
	if (TASK.KeepSampleON==1 && typeof(sample_image) !="undefined"){
		await renderImageOnCanvas(sample_image, sample_image_grid_index, ENV.SampleScale, canvasobj)
	}

	// Option: gray out before buffering test: (for overriding previous trial's test screen if current trial test screen has transparent elements?)	
	boundingBoxesChoice['x'] = []
	boundingBoxesChoice['y'] = []

if (typeof(test_images) !="undefined"){
	// Draw test object(s): 
	for (i = 0; i<test_images.length; i++){
		if (typeof(test_images[i])!="undefined"){
		// If HideTestDistractors, simply do not draw the image
		if(TASK.HideTestDistractors == 1){
			if (correct_index != i){
				boundingBoxesChoice.x.push([NaN, NaN]); 
				boundingBoxesChoice.y.push([NaN, NaN]); 
				continue 
			}
		}		

		funcreturn = await renderImageOnCanvas(test_images[i], test_image_grid_indices[i], ENV.TestScale, canvasobj); 
		boundingBoxesChoice.x.push(funcreturn[0]); 
		boundingBoxesChoice.y.push(funcreturn[1]); 
		}
	}
}
console.timeEnd('startrenderTEST')	
}//ASYNC FUNCTION BUFFERTESTIMAGES

//========== BUFFER CHOICE CANVAS ==========//
async function bufferChoiceUsingDot(sample_image, sample_image_grid_index, test_images, test_image_grid_indices, correct_index, choice_color, choice_radius, choice_grid_indices, canvasobj){
	// Option: gray out before buffering test: (for overriding previous trial's test screen if current trial test screen has transparent elements?)	
	boundingBoxesChoice['x'] = []
	boundingBoxesChoice['y'] = []
	// Draw test object(s): 
	for (i = 0; i<choice_grid_indices.length; i++){
		// If HideTestDistractors, simply do not draw the image
		if(TASK.HideChoiceDistractors == 1){
			if (correct_index != i){
				boundingBoxesChoice.x.push([NaN, NaN]); 
				boundingBoxesChoice.y.push([NaN, NaN]); 
				continue 
			}
		}
		if (i==0){
			funcreturn = await renderDotOnCanvas(choice_color, choice_grid_indices[i], choice_radius, canvasobj);
		} //same = circle
		else if (i==1){
			funcreturn = await renderSquareOnCanvas(choice_color, choice_grid_indices[i], 2*choice_radius, canvasobj);
		} //different = square
		boundingBoxesChoice.x.push(funcreturn[0]); 
		boundingBoxesChoice.y.push(funcreturn[1]); 
	} //FOR i choices

	// Option: draw sample (TODO: remove the blink between sample screen and test screen)
	if (TASK.KeepSampleON==1 && typeof(sample_image) !="undefined"){
		await renderImageOnCanvas(sample_image, sample_image_grid_index, ENV.SampleScale, canvasobj)
	}
	if (TASK.KeepTestON==1&& typeof(test_images[0]) !="undefined"){ //should only be one test image
		await renderImageOnCanvas(test_images[0], test_image_grid_indices[0], ENV.TestScale, canvasobj);
	}
} //FUNCTION bufferChoiceUsingDot

// Dot render using gridindex
async function renderDotOnCanvas(color, gridindex, dot_pixelradius, canvasobj){
	var context=canvasobj.getContext('2d');

	// Draw fixation dot
	if (Array.isArray(gridindex)){
		var xcent = gridindex[0]/ENV.CanvasRatio
		var ycent = gridindex[1]/ENV.CanvasRatio
	}//IF x,y coord provided
	else {
		var xcent = ENV.XGridCenter[gridindex]/ENV.CanvasRatio;
		var ycent = ENV.YGridCenter[gridindex]/ENV.CanvasRatio;	
	}//IF gridindex provided
	var rad = dot_pixelradius/ENV.CanvasRatio;
	context.beginPath();
	context.arc(xcent,ycent,rad,0*Math.PI,2*Math.PI);
	context.fillStyle=color; 
	context.fill();

	// Define (rectangular) boundaries of fixation
	// Bounding boxes of dot on canvas
	xbound = [ (xcent-rad)*ENV.CanvasRatio, (xcent+rad)*ENV.CanvasRatio ];
	ybound = [ (ycent-rad)*ENV.CanvasRatio, (ycent+rad)*ENV.CanvasRatio ];

	xbound[0]=xbound[0]+CANVAS.offsetleft;
	xbound[1]=xbound[1]+CANVAS.offsetleft;
	ybound[0]=ybound[0]+CANVAS.offsettop;
	ybound[1]=ybound[1]+CANVAS.offsettop;
	return [xbound, ybound]
}

async function renderSquareOnCanvas(color, gridindex, square_pixelwidth, canvasobj){
	// Draw Square
	var context=canvasobj.getContext('2d');
	var wd = square_pixelwidth/ENV.CanvasRatio;
	var xcent = ENV.XGridCenter[gridindex]/ENV.CanvasRatio;
	var ycent = ENV.YGridCenter[gridindex]/ENV.CanvasRatio;
	context.fillStyle=color;
	context.fillRect(xcent-wd/2,ycent-wd/2,wd,wd);


	// Define (rectangular) boundaries of fixation
	// Bounding boxes of dot on canvas
	xbound = [ (xcent-wd/2)*ENV.CanvasRatio, (xcent+wd/2)*ENV.CanvasRatio ];
	ybound = [ (ycent-wd/2)*ENV.CanvasRatio, (ycent+wd/2)*ENV.CanvasRatio ];

	xbound[0]=xbound[0]+CANVAS.offsetleft;
	xbound[1]=xbound[1]+CANVAS.offsetleft;
	ybound[0]=ybound[0]+CANVAS.offsettop;
	ybound[1]=ybound[1]+CANVAS.offsettop;
	return [xbound, ybound]
}


async function renderTriangleOnCanvas(color, gridindex, square_pixelwidth, canvasobj){
	// Draw Triangle
	var context=canvasobj.getContext('2d');
	var wd = square_pixelwidth/ENV.CanvasRatio;
	var xcent = ENV.XGridCenter[gridindex]/ENV.CanvasRatio;
	var ycent = ENV.YGridCenter[gridindex]/ENV.CanvasRatio;
	context.fillStyle=color;

	// var len_side = Math.sqrt(Math.pow(2*(wd/2),2))
	// var len_side = Math.sin(30 * Math.PI / 180);     // returns 1 (the sine of 90 degrees)


	context.beginPath();
    // context.moveTo(xcent, ycent + wd/2); //bottom vertex
    // context.lineTo(xcent-wd/2, ycent-wd/2); //top left
    // context.lineTo(xcent+wd/2, ycent-wd/2); //top right
    context.moveTo(xcent, ycent - wd/2); //bottom vertex
    context.lineTo(xcent-wd/2, ycent+wd/2); //top left
    context.lineTo(xcent+wd/2, ycent+wd/2); //top right
    context.fill();

	// Define (rectangular) boundaries of fixation
	// Bounding boxes of dot on canvas
	xbound = [ (xcent-wd/2)*ENV.CanvasRatio, (xcent+wd/2)*ENV.CanvasRatio ];
	ybound = [ (ycent-wd/2)*ENV.CanvasRatio, (ycent+wd/2)*ENV.CanvasRatio ];

	xbound[0]=xbound[0]+CANVAS.offsetleft;
	xbound[1]=xbound[1]+CANVAS.offsetleft;
	ybound[0]=ybound[0]+CANVAS.offsettop;
	ybound[1]=ybound[1]+CANVAS.offsettop;
	return [xbound, ybound]
}


async function renderImageOnCanvas(image, grid_index, scale, canvasobj){
	var context=canvasobj.getContext('2d');

	var xleft=NaN;
	var ytop=NaN;
	var xbound=[];
	var ybound=[];

	wd = image.width
	ht = image.height
	xleft = Math.round(ENV.XGridCenter[grid_index]/ENV.CanvasRatio - 0.5*wd*scale);
	ytop = Math.round(ENV.YGridCenter[grid_index]/ENV.CanvasRatio - 0.5*ht*scale);
	
	context.drawImage(
		image, // Image element
		xleft, // dx: Canvas x-coordinate of image's top-left corner. 
		ytop, // dy: Canvas y-coordinate of  image's top-left corner. 
		image.width*scale, // dwidth. width of drawn image. 
		image.height*scale); // dheight. height of drawn image.

	// For drawing cropped regions of an image in the canvas, see alternate input argument structures,
	// See: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
	
	// Bounding boxes of images on canvas
	xbound=[xleft*ENV.CanvasRatio, (xleft+wd*scale)*ENV.CanvasRatio];
	ybound=[ytop*ENV.CanvasRatio, (ytop+ht*scale)*ENV.CanvasRatio];

	xbound[0]=xbound[0]+CANVAS.offsetleft;
	xbound[1]=xbound[1]+CANVAS.offsetleft;
	ybound[0]=ybound[0]+CANVAS.offsettop;
	ybound[1]=ybound[1]+CANVAS.offsettop;

	return [xbound, ybound]
}


function displayTrial(sequence,tsequence){
	var resolveFunc
	var errFunc
	p = new Promise(function(resolve,reject){
		resolveFunc = resolve;
		errFunc = reject;
	}).then();

	var start = null;
	var tActual = []
	async function updateCanvas(timestamp){

		// If start has not been set to a float timestamp, set it now.
		if (!start) start = timestamp;

		// If time to show new frame, 
		if (timestamp - start > tsequence[frame.current]){
			//console.log('Frame =' + frame.current+'. Duration ='+(timestamp-start)+'. Timestamp = ' + timestamp)
			
			//3D render
			if (FLAGS.scene3d == 1){
				
				if (sequence[frame.current] == "sample" || sequence[frame.current] == "test" || sequence[frame.current] == "choice"
					|| (sequence[frame.current] == "touchfix" && TASK.FixationUsesSample)){

					var taskscreen = [sequence[frame.current].charAt(0).toUpperCase() + sequence[frame.current].slice(1)]
					if (sequence[frame.current] == "touchfix" && TASK.FixationUsesSample){
						taskscreen = "Sample"
					}

					renderer.autoClear = false
				
					if (TASK.KeepSampleON == 1 && (sequence[frame.current] == "test" || sequence[frame.current]=="choice")){
						setViewport(TASK.SampleGridIndex)
						var camera = scene["Sample"].getObjectByName("cam"+CURRTRIAL.sample_scenebag_label)
				    	renderer.render(scene["Sample"],camera) //takes >1ms, do before the fast 2D swap (<1ms)	
				   	}
					if (TASK.KeepTestON == 1 && sequence[frame.current] == "choice"){
						setViewport(TASK.TestGridIndex[0])
						var camera = scene["Test"].getObjectByName("cam"+CURRTRIAL.test_scenebag_labels)
						renderer.render(scene["Test"],camera)
					}

					if (sequence[frame.current] == "sample" || sequence[frame.current] == "test"
						|| (sequence[frame.current] == "touchfix" && TASK.FixationUsesSample)){
						console.time("first scene")
						if (sequence[frame.current] == "touchfix" && TASK.FixationUsesSample){
							setViewport(CURRTRIAL.fixationgridindex)
							var camera = scene["Sample"].getObjectByName("cam"+CURRTRIAL.sample_scenebag_label)							
						}//fixationusessample
						else if (sequence[frame.current]=="sample"){
							setViewport(TASK.SampleGridIndex)
							var camera = scene["Sample"].getObjectByName("cam"+CURRTRIAL.sample_scenebag_label)							
						}//sample
						else if (sequence[frame.current]=="test"){
							setViewport(TASK.TestGridIndex[0])
							var camera = scene[taskscreen].getObjectByName("cam"+CURRTRIAL.test_scenebag_labels[0])					
						} //test
				    	renderer.render(scene[taskscreen],camera) //takes >1ms, do before the fast 2D swap (<1ms)
						console.timeEnd("first scene")
				    	if (sequence[frame.current] == "test" && CURRTRIAL.test_scenebag_labels.length > 1){
				    		for (var j = 1; j<=CURRTRIAL.test_scenebag_labels.length - 1; j++){
				    			console.time("test1Update")
						    	updateSingleFrame3D(
										taskscreen,
										CURRTRIAL.test_scenebag_labels[j],
										CURRTRIAL.test_scenebag_indices[j],
										TASK.TestGridIndex[j]
									)
									console.timeEnd("test1Update")
								setViewport(TASK.TestGridIndex[j])
								var camera = scene[taskscreen].getObjectByName("cam"+CURRTRIAL.test_scenebag_labels[j])
								// var camera = scene[sequence[frame.current].charAt(0).toUpperCase() + sequence[frame.current].slice(1)].getObjectByName(-1)
								console.time("test1 render")
						    	renderer.render(scene[taskscreen],camera) //takes >1ms, do before the fast 2D swap (<1ms)
						    	console.timeEnd("test1 render")
				    		} //FOR j test items
				    	} //IF test

				    	if (sequence[frame.current] == "sample" && TASK.Agent == "SaveImages" && FLAGS.savedata == 1){
				    		saveScreenshot(VISIBLECANVASWEBGL,CURRTRIAL.num,sequence[frame.current],frame.current)
				    	}//save out images
					} //IF sample || test || fixationusessample

					if (sequence[frame.current] == "choice" && TASK.KeepTestON == 0 && TASK.KeepSampleON == 0){
						 VISIBLECANVASWEBGL.style.visibility='hidden';
					} else{
						VISIBLECANVASWEBGL.style.visibility='visible';
					}
				
				    console.log("t=" + (timestamp-start) + "showing " + sequence[frame.current])
				} //IF sample || test || choice || fixationusessample
				else {
				    VISIBLECANVASWEBGL.style.visibility='hidden';
				    console.log("t=" + (timestamp-start) + "hiding webgl canvas")
				} //ELSE hide 3D
			} //IF 3D Scene

			if (ENV.OffscreenCanvasAvailable){
				//pre-rendered offscreen, now transfer
				var renderstr = OFFSCREENCANVAS.commitTo(VISIBLECANVAS.getContext("bitmaprenderer"))

				if (renderstr.status == "failed"){
					console.log("**** FAILED on 1ST rendering attempt of " + sequence[frame.current])

					// attempt again
					tActual[frame.current] = Math.round(100*(timestamp - start))/100 //in milliseconds, rounded to nearest hundredth of a millisecond

					//pre-rendered offscreen, now transfer
					var renderstr = OFFSCREENCANVAS.commitTo(VISIBLECANVAS.getContext("bitmaprenderer"))				
					console.log("**** " + renderstr.status + " on 2ND rendering attempt of " + sequence[frame.current])

					if (renderstr.status == "failed"){
						if (sequence[frame.current] == "touchfix" || sequence[frame.current] == "test" || sequence[frame.current] == "choice"){
							for (var j=0; j < 100; j++){
								// attempt again
								await setTimeout(j*100)
								tActual[frame.current] = Math.round(100*(timestamp - start))/100 //in milliseconds, rounded to nearest hundredth of a millisecond


								//pre-rendered offscreen, now transfer
								var renderstr = OFFSCREENCANVAS.commitTo(VISIBLECANVAS.getContext("bitmaprenderer"))				

								if (renderstr.status == "succeeded"){
									break
								}
							}
							console.log("Render "  + sequence[frame.current] + " " + renderstr.status + " after " + j + " attempts")
						}
						else {
							tActual[frame.current] = -99
							console.log("Skipping render since not touchfix or test screen")
						} //if touchfix || test
					} //if failed again
				} //if failed
			}//IF Offscreen api available
			else {
				//render directly, offscreencanvas is visiblecanvas
				renderScreen(sequence[frame.current],OFFSCREENCANVAS)
			}//IF Offscreen not available

	    	if (sequence[frame.current] == "sample" && TASK.Agent == "SaveImages" && FLAGS.savedata == 1){
	    		saveScreenshot(VISIBLECANVAS,CURRTRIAL.num,sequence[frame.current],frame.current)
	    	}//save out images

			tActual[frame.current] = Math.round(100*(timestamp - start))/100 //in milliseconds, rounded to nearest hundredth of a millisecond
			frame.shown[frame.current]=1;
			frame.current++;
		};
		// continue if not all frames shown
		if (frame.shown[frame.shown.length-1] != 1){

			if (FLAGS.scene3d == 1){
					
				var taskscreen = [sequence[frame.current].charAt(0).toUpperCase() + sequence[frame.current].slice(1)]
				if (sequence[frame.current] == "sample" && scene["Sample"].framenum != frame.current || 
					sequence[frame.current] == 'touchfix' && TASK.FixationUsesSample){
					console.time("sampleUpdate")
					if (sequence[frame.current] == 'touchfix' && TASK.FixationUsesSample){
						updateSingleFrame3D(
									"Sample",
									CURRTRIAL.sample_scenebag_label,
									CURRTRIAL.sample_scenebag_index,
									CURRTRIAL.fixationgridindex
						)					
					}//IF FixationUsesSample
					else{
						updateSingleFrame3D(
									taskscreen,
									CURRTRIAL.sample_scenebag_label,
									CURRTRIAL.sample_scenebag_index,
									TASK.SampleGridIndex
								)						
					}//IF sample
					scene["Sample"].framenum = frame.current
					console.log("UPDATED SINGLEFRAME3D SAMPLE" + Math.random())	
					console.timeEnd("sampleUpdate")	
				} //IF sample
				else if (sequence[frame.current] == "test"  && scene["Test"].framenum != frame.current){
					boundingBoxesChoice3D = {'x':[],'y':[]}
					
					console.time("test0update")
					updateSingleFrame3D(
								taskscreen,
								CURRTRIAL.test_scenebag_labels[0],
								CURRTRIAL.test_scenebag_indices[0],
								TASK.TestGridIndex[0]
							) //Update 3D scene prior to next frame draw
				scene["Test"].framenum = frame.current
				 console.log("UPDATED SINGLEFRAME3D TEST")		
				 console.timeEnd("test0update")
				} //ELSE IF test

				if (ENV.OffscreenCanvasAvailable){// && sequence[frame.current] != "sample" && sequence[frame.current] != "test"){
					renderScreen(sequence[frame.current],OFFSCREENCANVAS) //render 2D image offscreen prior to next frame draw
					if (sequence[frame.current] == "choice"){
						boundingBoxesChoice3D = boundingBoxesChoice //default to 2D coords for same different buttons
					}
				} //pre-render next frame
			} //3D Scene + 2D Image
			else {
				if (ENV.OffscreenCanvasAvailable){
					renderScreen(sequence[frame.current],OFFSCREENCANVAS)
				} //pre-render next frame				
			} //2D Image
			window.requestAnimationFrame(updateCanvas);
		}
		else{
			resolveFunc(tActual);
		}
	}
	//requestAnimationFrame advantages: goes on next screen refresh and syncs to browsers refresh rate on separate clock (not js clock)
	window.requestAnimationFrame(updateCanvas); // kick off async work
	return p
} 

function renderScreen(screenType,canvasobj){
	//console.time('RENDERFUNC')
	if (FLAGS.savedata == 0){
		renderBlankWithGridMarkers(ENV.XGridCenter,ENV.YGridCenter, 
			TASK.StaticFixationGridIndex,TASK.SampleGridIndex,TASK.TestGridIndex, TASK.ChoiceGridIndex,
			ENV.FixationScale, ENV.SampleScale, ENV.TestScale, ENV.ChoiceScale,
			ENV.ImageWidthPixels, ENV.CanvasRatio,canvasobj);
	}
	else if (FLAGS.savedata == 1){
		renderBlank(canvasobj,TASK.BackgroundColor2D)
	}
	switch (screenType) {
	case 'blank':
		renderBlank(canvasobj,TASK.BackgroundColor2D)
		break
	case 'blankWithGridMarkers':
		renderBlankWithGridMarkers(ENV.XGridCenter,ENV.YGridCenter, 
			TASK.StaticFixationGridIndex,TASK.SampleGridIndex,TASK.TestGridIndex, TASK.ChoiceGridIndex,
			ENV.FixationScale, ENV.SampleScale, ENV.TestScale, ENV.ChoiceScale,
			ENV.ImageWidthPixels, ENV.CanvasRatio,canvasobj);
		break
	case 'touchfix':
		if(TASK.FixationUsesSample != 1){
			if (TASK.TestON <= 0){
				bufferFixationUsingDot(ENV.FixationColor, CURRTRIAL.fixationgridindex,
									ENV.FixationRadius, canvasobj);
			}
			else if (TASK.TestON > 0){
				bufferFixationUsingTriangle(ENV.ChoiceColor, CURRTRIAL.fixationgridindex,
									ENV.FixationRadius, canvasobj);
			}
		}
		else {
			bufferFixationUsingImage(CURRTRIAL.sampleimage, CURRTRIAL.fixationgridindex,
									ENV.SampleScale, canvasobj)	
		}
		break
	case 'sample':
		bufferSampleImage(CURRTRIAL.sampleimage, TASK.SampleGridIndex,canvasobj);
		break
	case 'test':
		bufferTestImages(CURRTRIAL.sampleimage, TASK.SampleGridIndex, 
						CURRTRIAL.testimages, TASK.TestGridIndex, CURRTRIAL.correctitem, 
						canvasobj);
		break
	case 'choice':
		bufferChoiceUsingDot(CURRTRIAL.sampleimage, TASK.SampleGridIndex, 
						CURRTRIAL.testimages, TASK.TestGridIndex, CURRTRIAL.correctitem, 
						ENV.ChoiceColor,ENV.ChoiceRadius,TASK.ChoiceGridIndex,
						canvasobj);
		break
	case 'reward':
		renderReward(canvasobj)
		break
	case 'punish':
		renderPunish(canvasobj)
		break
	default:
	}
	//console.timeEnd('RENDERFUNC')

}

function renderBlank(canvasobj,bkgdcolor){
	var context=canvasobj.getContext('2d');
	context.fillStyle=bkgdcolor;
	context.fillRect(0,100,canvasobj.width,canvasobj.height);
	// context.clearRect(0,0,canvasobj.width,canvasobj.height);
}

function renderBlankWithGridMarkers(gridx,gridy,fixationgridindex,samplegridindex,testgridindex,choicegridindex,fixationscale,samplescale,testscale,choicescale,imwidth,canvasratio,canvasobj)
{
	var outofbounds_str = ''
	var context=canvasobj.getContext('2d');
	context.clearRect(0,0,canvasobj.width,canvasobj.height);

	//Show image positions & display grid
	//Display grid
	for (var i = 0; i <= gridx.length-1; i++){
		rad = 10
		context.beginPath()
		context.arc(gridx[i]/ENV.CanvasRatio,gridy[i]/ENV.CanvasRatio,rad/ENV.CanvasRatio,0*Math.PI,2*Math.PI)
		context.fillStyle="red"
		context.fill();

		var displaycoord = [gridx[i]-rad,gridy[i]-rad,gridx[i]+rad,gridy[i]+rad]
		var outofbounds=checkDisplayBounds(displaycoord)
		if (outofbounds == 1){
			outofbounds_str = outofbounds_str + "<br>" + "gridpoint" + i + " is out of bounds"
		}
		displayGridCoordinate(i,[gridx[i],gridy[i]],canvasobj)
	}

	//Fixation Image Bounding Box
	var wd = imwidth*fixationscale
	var xcent = gridx[fixationgridindex]/ENV.CanvasRatio
	var ycent = gridy[fixationgridindex]/ENV.CanvasRatio
	context.strokeStyle="white"
	context.strokeRect(xcent-wd/2,ycent-wd/2,wd+1,wd+1)

	var displaycoord = [(xcent-wd/2)*ENV.CanvasRatio,(ycent-wd/2)*ENV.CanvasRatio,
						(xcent+wd/2)*ENV.CanvasRatio,(ycent+wd/2)*ENV.CanvasRatio]
	var outofbounds=checkDisplayBounds(displaycoord)
	if (outofbounds == 1){
		outofbounds_str = outofbounds_str + "<br>" + "Fixation dot is out of bounds"
	}
	displayPhysicalSize(TASK.Tablet,displaycoord,canvasobj)

	
	//Sample Image Bounding Box
	var wd = imwidth*samplescale
	var xcent = gridx[samplegridindex]/ENV.CanvasRatio
	var ycent = gridy[samplegridindex]/ENV.CanvasRatio
	context.strokeStyle="green"
	context.strokeRect(xcent-wd/2,ycent-wd/2,wd,wd)

	var displaycoord = [(xcent-wd/2)*ENV.CanvasRatio,(ycent-wd/2)*ENV.CanvasRatio,
						(xcent+wd/2)*ENV.CanvasRatio,(ycent+wd/2)*ENV.CanvasRatio]
	var outofbounds=checkDisplayBounds(displaycoord)
	if (outofbounds == 1){
		outofbounds_str = outofbounds_str + "<br>" + "Sample Image is out of bounds"
	}
	displayPhysicalSize(TASK.Tablet,displaycoord,canvasobj)


	//Test Image Bounding Box(es)
	for (var i = 0; i <= testgridindex.length-1; i++){
		var wd = imwidth*testscale
		var xcent = gridx[testgridindex[i]]/ENV.CanvasRatio
		var ycent = gridy[testgridindex[i]]/ENV.CanvasRatio
		context.strokeStyle="black"
		context.strokeRect(xcent-wd/2,ycent-wd/2,wd,wd)

		var displaycoord = [(xcent-wd/2)*ENV.CanvasRatio,(ycent-wd/2)*ENV.CanvasRatio,
						(xcent+wd/2)*ENV.CanvasRatio,(ycent+wd/2)*ENV.CanvasRatio]
		var outofbounds=checkDisplayBounds(displaycoord)
		if (outofbounds == 1){
			outofbounds_str = outofbounds_str + "<br>" + "Test Image" + i + " is out of bounds"
		}
		displayPhysicalSize(TASK.Tablet,displaycoord,canvasobj)
	}

	//Choice Image Bounding Box(es)
	if (TASK.TestON > 0){
		for (var i = 0; i <= choicegridindex.length-1; i++){
			var wd = imwidth*choicescale
			var xcent = gridx[choicegridindex[i]]/ENV.CanvasRatio
			var ycent = gridy[choicegridindex[i]]/ENV.CanvasRatio
			context.strokeStyle="red"
			context.strokeRect(xcent-wd/2,ycent-wd/2,wd,wd)

			var displaycoord = [(xcent-wd/2)*ENV.CanvasRatio,(ycent-wd/2)*ENV.CanvasRatio,
							(xcent+wd/2)*ENV.CanvasRatio,(ycent+wd/2)*ENV.CanvasRatio]
			var outofbounds=checkDisplayBounds(displaycoord)
			if (outofbounds == 1){
				outofbounds_str = outofbounds_str + "<br>" + "Choice Image" + i + " is out of bounds"
			}
			displayPhysicalSize(TASK.Tablet,displaycoord,canvasobj)
		}
	} //IF testON (same-different choice screen)

	if (FLAGS.scene3d == 1 && (VISIBLECANVASWEBGL.width > 4096 || VISIBLECANVASWEBGL.height > 4096) ){
		outofbounds_str = outofbounds_str + "Canvas may be too large for webgl limit of 4096 pixels in either dimension -- 3d rendering may not be accurate! Consider using a smaller display size."
	}

	if (outofbounds_str == ''){
		outofbounds_str = 'All display elements are fully visible'
	}

	displayoutofboundsstr = outofbounds_str
	updateImageLoadingAndDisplayText(' ')
}

function renderReward(canvasobj){
	var context=canvasobj.getContext('2d');
	context.fillStyle="green";
	context.fillRect(xcanvascenter/ENV.CanvasRatio-200/ENV.CanvasRatio,
					ycanvascenter/ENV.CanvasRatio-200/ENV.CanvasRatio,400/ENV.CanvasRatio,400/ENV.CanvasRatio);
}

function renderPunish(canvasobj){
	var context=canvasobj.getContext('2d');
	context.fillStyle="#3c3c3c";
	context.fillRect(xcanvascenter/ENV.CanvasRatio-200/ENV.CanvasRatio,
					ycanvascenter/ENV.CanvasRatio-200/ENV.CanvasRatio,400/ENV.CanvasRatio,400/ENV.CanvasRatio);
}

async function bufferFixationUsingImage(image, gridindex, scale, canvasobj){
// 	var context=canvasobj.getContext('2d');
// 	context.clearRect(0,0,canvasobj.width,canvasobj.height);

	boundingBoxesFixation['x']=[]
	boundingBoxesFixation['y']=[]
	
	if (typeof(image)!= "undefined"){
	funcreturn = await renderImageOnCanvas(image, gridindex, scale, canvasobj); 
	boundingBoxesFixation.x.push(funcreturn[0]);
	boundingBoxesFixation.y.push(funcreturn[1]);
	}
}

async function bufferFixationUsingDot(color, gridindex, dot_pixelradius, canvasobj){
	 console.time('startrenderFIXATION')

	boundingBoxesFixation['x']=[]
	boundingBoxesFixation['y']=[]

	funcreturn = await renderDotOnCanvas(color, gridindex, dot_pixelradius, canvasobj)
	boundingBoxesFixation.x.push(funcreturn[0]);
	boundingBoxesFixation.y.push(funcreturn[1]);

	 console.timeEnd('startrenderFIXATION')

}

async function bufferFixationUsingTriangle(color, gridindex, dot_pixelradius, canvasobj){
	 console.time('startrenderFIXATION')

	boundingBoxesFixation['x']=[]
	boundingBoxesFixation['y']=[]

	funcreturn = await renderTriangleOnCanvas(color, gridindex, 2*dot_pixelradius, canvasobj);
	boundingBoxesFixation.x.push(funcreturn[0]);
	boundingBoxesFixation.y.push(funcreturn[1]);

	 console.timeEnd('startrenderFIXATION')
}


function checkDisplayBounds(displayobject_coord){
	var outofbounds=0
	if (displayobject_coord[0]/ENV.CanvasRatio < CANVAS.workspace[0] ||
		displayobject_coord[1]/ENV.CanvasRatio < CANVAS.workspace[1] ||
		displayobject_coord[2]/ENV.CanvasRatio > CANVAS.workspace[2] ||
		displayobject_coord[3]/ENV.CanvasRatio > CANVAS.workspace[3]){
		outofbounds=1
	}
	return outofbounds
}
function setupImageLoadingText(){
	var textobj = document.getElementById("image-loading-text")
	textobj.style.top = CANVAS.offsettop + "px"
	textobj.innerHTML = ''
	setupCanvasListeners(textobj)
}

function updateImageLoadingAndDisplayText(str){
	var textobj = document.getElementById("image-loading-text")

	// Software check for frame drops
	var dt = []
	var u_dt = 0
	for (var i=0; i<=CURRTRIAL.tsequenceactual.length-1; i++){
		dt[i] = CURRTRIAL.tsequenceactual[i] - CURRTRIAL.tsequencedesired[i]
		u_dt = u_dt + Math.abs(dt[i])
	}
	u_dt = u_dt/dt.length

	textobj.innerHTML =
	str
	+ imageloadingtimestr
	+ "<br>" + displayoutofboundsstr 
	+ "<br>" + "Software reported frame display (t_actual - t_desired) :"
	+ "<br>" + "<font color=red> mean dt = " + Math.round(u_dt) + " ms"
	+ "  (min=" + Math.round(Math.min(... dt)) + ", max=" + Math.round(Math.max(... dt)) + ") </font>"
}

function displayPhysicalSize(tabletname,displayobject_coord,canvasobj){
	var visible_ctxt = canvasobj.getContext('2d');
	visible_ctxt.textBaseline = "hanging";
	visible_ctxt.fillStyle = "white";
	visible_ctxt.font = "16px Verdana";
	visible_ctxt.fillText( 
		Math.round(100*(displayobject_coord[2]-displayobject_coord[0])/ENV.ViewportPPI)/100 +
		' x ' +
		Math.round(100*(displayobject_coord[3]-displayobject_coord[1])/ENV.ViewportPPI)/100 + 
		' in', 
		displayobject_coord[0]/ENV.CanvasRatio,(displayobject_coord[1]-16)/ENV.CanvasRatio
	);
}

function displayGridCoordinate(idx,xycoord,canvasobj){
	var visible_ctxt = canvasobj.getContext('2d');
	visible_ctxt.textAlign = "center";
	visible_ctxt.textBaseline = "middle";
	visible_ctxt.fillStyle = "white";
	visible_ctxt.font = "20px Verdana";
	visible_ctxt.fillText(idx,xycoord[0]/ENV.CanvasRatio, xycoord[1]/ENV.CanvasRatio)
}

function setViewport(gridindex){
	//==== RENDERER 2D VIEWPORT
	//width and height are determined by object size Inches. the viewport can't be smaller than the object's size. otherwise the object will look cropped
	var scenecenterX = ENV.XGridCenter[gridindex]
	var scenecenterY = ENV.YGridCenter[gridindex]
	var scenewidth = renderer.getContext().canvas.width
	var sceneheight = renderer.getContext().canvas.height
	var left = scenecenterX - scenewidth/2
	var bottom = -sceneheight/2 + (VISIBLECANVAS.clientHeight-scenecenterY)


	renderer.setViewport(left, bottom, scenewidth, sceneheight);
	renderer.setScissor(left,bottom,scenewidth,sceneheight)
	renderer.setScissorTest(true)
}

async function saveScreenshot(canvasobj,currtrial,frametype,framenum){
	//---- upload screenshot to firebase 
	//sample image will be uploaded to the appropriate folder in the scene 

	var currtrial_samplepath = TASK.ImageBagsSample[CURRTRIAL.sample_scenebag_label]
	var currtrial_date = ENV.DataFileName
	var currtrial_parampath = ENV.ParamFileName

	//path to scene folder
	var ind_start = currtrial_samplepath.lastIndexOf('/')
	var ind_end = currtrial_samplepath.indexOf('.js')
	var scenefolder = currtrial_samplepath.substring(0,ind_end)

	//paramfolder name
	var ind_start = currtrial_parampath.lastIndexOf('/')
	var ind_end = currtrial_parampath.indexOf('.txt')
	var paramfolder = currtrial_parampath.substring(ind_start+1,ind_end)

	//date 
	var ind_start = currtrial_date.lastIndexOf('/')
	var ind_end = currtrial_date.indexOf('T')
	var date = currtrial_date.substring(ind_start+1,ind_end) 

	var storage_path = scenefolder + '_scene_'
 						+ date + '_' + paramfolder + '_'
						+ ENV.DeviceName + '_device'

	if (canvasobj.width > 4096 || canvasobj.height > 4096){
		console.log("Canvas may be too large for webgl limit of 4096 pixels in either dimension -- Image Saving may not be accurate! Consider using a smaller display size.")
	}

	canvasobj.toBlob(function(blob){
		var fullpath = storage_path + '/'
						+ canvasobj.id 
						+ '_' + 'trialnum' + currtrial 
						+ '_' + frametype + framenum 
						+ '_' + 'label' + CURRTRIAL.sample_scenebag_label
						+ '.png'
		try {
			var response = storage.ref().child(fullpath).put(blob)
			console.log("saved image: " + fullpath);
			console.log("FIREBASE: Successful image file upload. Size:" + Math.round(response.totalBytes/1000) + 'kb')
		}
		catch (error){
			console.log(error)
		}
	})
}//FUNCTION saveScreenshot