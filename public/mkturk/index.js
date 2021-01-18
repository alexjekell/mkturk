// Delete imports after developing. Solely for type checking pursposes.
// import firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/storage';
// import { formatWithOptions } from 'util';
/* 
 * Check for MTurk tokens in the URL
 */
let mturkUserConfig = {};

if (window.location.search) {
  try {
    let mturkCfgPairStr = window.location.search.split('?')[1].split('&');
    mturkCfgPairStr.forEach(str => {
      let pair = str.split('=');
      if (pair[0] == 'AID') { // AID: assignmentId
        mturkUserConfig.aid = pair[1];
      } else if (pair[0] == 'HID') { // HID: hitId
        mturkUserConfig.hid = pair[1];
      } else if (pair[0] == 'WID') { // WID: workerId
        mturkUserConfig.wid = pair[1];
      } else if (pair[0] == 'TASK') { // TASK: name of task in params_storage
        mturkUserConfig.task = pair[1];
      }
    });
  } catch (e) {
    console.error('Error Parsing User Config:', e);
  }
}

//================== AUTHENTICATE GOOGLE ==================//
const auth = firebase.auth();
auth.getRedirectResult().then((redirectResult) => {
  if (redirectResult.user) {
    // User just signed in
    ENV.ResearcherDisplayName = redirectResult.user.displayName;
    ENV.ResearcherEmail = result.user.email;
    ENV.ResearcherID = result.user.uid;

    console.log(`Sign-In Redirect Result, USER ${redirectResult.user.email} is signed in`);
    updateHeadsUpDisplay();
  } else if (auth.currentUser) {
    // User already signed in.
    ENV.ResearcherDisplayName = auth.currentUser.displayName;
    ENV.ResearcherEmail = auth.currentUser.email;
    ENV.ResearcherID = auth.currentUser.uid;

    console.log(`Sign-In Redirect Result, USER ${auth.currentUser.email} is signed in`);
    updateHeadsUpDisplay();
  } else {
    console.log('User Not Yet Authenticated');
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.emails.read');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    auth.signInWithRedirect(provider);    
  }
}).catch((authError) => {
  console.error(`[Authentication Error]: ${authError}`);
});

auth.onAuthStateChanged((user) => {
  if (user && Object.keys(mturkUserConfig).length) {
    user.getIdToken(true)
      .then(async (idToken) => {
        mturkUserConfig.token = idToken;
        console.log(`Auth Token: ${idToken}`);
        processMturkUser(mturkUserConfig).then(async (res) => {
          if (res.data.message == 'assignment entry already exists') {
            console.log('window will close here');
            //window.close();
          }
          if (res.data.status == 'success') {
            ENV.MTurkWorkerId = mturkUserConfig.wid;
          }
        }).catch((error) => {
          console.error(`[processMturkUser] Error: ${error}`);
        });
      });
  }
});
//================== (end) AUTHENTICATE GOOGLE ==================//


// //================== AUTHENTICATE GOOGLE ==================//
// // [START authstatelistener]
// var provider = new firebase.auth.GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
// firebase.auth().getRedirectResult().then(function(result) {
// 	console.log('url:', window.location.href);
// 	console.log('what:', window.location.search);
// 	let thisUrl = window.location.href;
// 	console.log(thisUrl.split('?MID=')[1]);
//   if (result.user) {
//     // User just signed in. you can get the result.credential.
//     ENV.ResearcherDisplayName = result.user.displayName;
// 		ENV.ResearcherEmail = result.user.email;
// 		ENV.ResearcherID = result.user.uid

// 		console.log('Sign-In Redirect Result, USER ' + result.user.email + ' is signed in')
// 		updateHeadsUpDisplay()
//   } else if (firebase.auth().currentUser) {
//     // User already signed in.
// 		ENV.ResearcherDisplayName = firebase.auth().currentUser.displayName;
// 		ENV.ResearcherEmail = firebase.auth().currentUser.email;
// 		ENV.ResearcherID = firebase.auth().currentUser.uid

// 		console.log('Sign-In Redirect Result, USER ' + firebase.auth().currentUser.email + ' is signed in')
// 		updateHeadsUpDisplay()		
//   } else {
// 		// No user signed in, update your UI, show the redirect sign-in screen.
// 		firebase.auth().signInWithRedirect(provider)
//   }
// });
// //================== (end) AUTHENTICATE GOOGLE ==================//

// Check Availability of APIs
if (typeof(navigator.usb) == "object"){ ENV.WebUSBAvailable = 1 }
if (typeof(navigator.bluetooth) == "object"){ ENV.WebBluetoothAvailable = 1 }
if (typeof(navigator.getBattery) == "function"){ ENV.BatteryAPIAvailable = 1 }
if (typeof(OffscreenCanvas) == "function"){ ENV.OffscreenCanvasAvailable = 1 }
// ENV.OffscreenCanvasAvailable = 0;

// Button callbacks for inline connection to arduino device
document.querySelector("button[id=googlesignin]").style.display = "block";
document.querySelector("button[id=googlesignin]").style.visibility = "visible";
document.querySelector('button[id=googlesignin')
  .addEventListener('pointerup', firebaseRedirectSignIn, false);
document.querySelector('button[id=reloadpage]')
  .addEventListener('pointerup', () => {
    window.location.reload();
  }, false);


//---- for Safari
document.querySelector('button[id=googlesignin]')
  .addEventListener('click', firebaseRedirectSignIn, false);
document.querySelector('button[id=reloadpage]')
  .addEventListener('click', () => {
    window.location.reload();
  }, false);
//---- (END) for Safari


var textobj = document.getElementById("headsuptext");
textobj.addEventListener('pointerup', headsuptext_listener, false);

//---- for Safari
textobj.addEventListener('click', headsuptext_listener, false);
//---- (END) for Safari


//============= Initialize Audio & Battery Objects ==================//

// Prevent window scrolling and bounce back effect
	// document.body.addEventListener('touchmove',function(event){
	// 	event.preventDefault();
  // }, {capture: false, passive:false});
  
document.body.addEventListener('touchmove', (event) => {
  event.preventDefault();
}, { capture: false, passive: false });

//Audio pulses for reward
var audiocontext = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audiocontext.createGain();
gainNode.connect(audiocontext.destination);

// Check availability of OffScreenCanvas API
// ENV.DevicePixelRatio = window.devicePixelRatio || 1;
ENV.DevicePixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;

if (ENV.OffscreenCanvasAvailable) {
	var visiblecontext = VISIBLECANVAS.getContext("bitmaprenderer");
}	else {
	var visiblecontext = VISIBLECANVAS.getContext("2d");
}
var backingStoreRatio = visiblecontext.webkitBackingStorePixelRatio
  || visiblecontext.mozBackingStorePixelRatio
  || visiblecontext.msBackingStorePixelRatio
  || visiblecontext.oBackingStorePixelRatio
  || visiblecontext.backingStorePixelRatio
  || 1;

ENV.CanvasRatio = backingStoreRatio / ENV.DevicePixelRatio;
	

// Check Availability of Battery API
if (ENV.BatteryAPIAvailable) {
  // Monitor Battery - from: https://www.w3.org/TR/battery-status/
  navigator.getBattery()
    .then((batteryobj) => {
      logEVENTS('Battery', [batteryobj.level, batteryobj.dischargingTime], 'timeseries');

      batteryobj.addEventListener('levelchange', () => {
        logEVENTS('Battery', [batteryobj.level, batteryobj.dischargingTime], 'timeseries');
      });

    });
} // Do nothing if BatteryAPI unavailable
//============= (end) Initialize Audio & Battery Objects ==================//

function connectHardwareButtonPromise() {
  let resolveFunc;
  let errFunc;

  let p = new Promise((resolve, reject) => {
    resolveFunc = resolve;
    errFunc = reject;
  }).then((resolveVal) => {
    console.log(`User clicked ${resolveVal}`);
  });

  function* waitforclickGenerator() {
    let buttonClicked = [-1];
    while (true) {
      buttonClicked = yield buttonClicked;
      resolveFunc(buttonClicked);
    }
  }

  waitforClick = waitforclickGenerator(); // start async function
  waitforClick.next(); // move out of default sate
  return p;
}

// function connectHardwareButtonPromise(){
//   var resolveFunc
//   var errFunc
//   p = new Promise(function(resolve,reject){
//     resolveFunc = resolve;
//     errFunc = reject;
//   }).then(function(resolveval){console.log('User clicked ' + resolveval)});

//   function *waitforclickGenerator(){
//     var buttonclicked =[-1];
//     while (true){
//       buttonclicked = yield buttonclicked;
//       resolveFunc(buttonclicked);
//     }
//   }

//   waitforClick = waitforclickGenerator(); // start async function
//   waitforClick.next(); //move out of default state
//   return p;
// }

function skipHardwareDevice(event) {
  event.preventDefault(); // prevents additional downstream call of click listener
  localStorage.setItem('ConnectUSB', 0);
  waitforClick.next(1);
}


(async function(){
	document.querySelector('button[id=quickload]')
    .addEventListener('pointerup', quickLoad_listener, false);

  //--- for Safari
  document.querySelector('button[id=quickload')
    .addEventListener('click', quickLoad_listener, false);

	// if ( ENV.WebUSBAvailable ){
	// 	await usb_scriptLoaded
	// 	document.querySelector ("button[id=connectusb]").addEventListener(
	// 		'pointerup',findUSBDevice,false)
	// 	document.querySelector("button[id=nousb]").addEventListener(
	// 		'pointerup',skipHardwareDevice,false)
	// 	document.querySelector("button[id=preemptRFID]").addEventListener(
	// 		'pointerup',preemptRFID_listener,false)	

	// 		//---- for Safari
	// 		document.querySelector ("button[id=connectusb]").addEventListener(
	// 			'click',findUSBDevice,false)
	// 		document.querySelector("button[id=nousb]").addEventListener(
	// 			'click',skipHardwareDevice,false)
	// 		document.querySelector("button[id=preemptRFID]").addEventListener(
	// 			'click',preemptRFID_listener,false)	
	// 		//---- (END) for Safari
  // }

  if (ENV.WebUSBAvailable) {
    await usb_scriptLoaded;
    document.querySelector('button[id=connectusb]')
      .addEventListener('pointerup', findUSBDevice, false);
    document.querySelector("button[id=nousb]")
      .addEventListener('pointerup', skipHardwareDevice, false);
    document.querySelector("button[id=preemptRFID]")
      .addEventListener('pointerup', preemptRFID_listener, false);	

    //---- for Safari
    document.querySelector ("button[id=connectusb]")
      .addEventListener('click', findUSBDevice, false);
    document.querySelector("button[id=nousb]")
      .addEventListener('click', skipHardwareDevice, false);
    document.querySelector("button[id=preemptRFID]")
      .addEventListener('click', preemptRFID_listener, false);	
		//---- (END) for Safari
  }

	if (ENV.WebBluetoothAvailable) {
		await ble_scriptLoaded;
		await blescale_scriptLoaded;
		//Button callback for asynchronous connection to bluetooth scale
    document.querySelector("button[id=connectblescale]")
      .addEventListener('pointerup', blescaleconnect, false);

		//---- for Safari
    document.querySelector("button[id=connectblescale]")
      .addEventListener('click', blescaleconnect, false);
		//---- (END) for Safari
  }

	// document.querySelector("button[id=doneEditingParams]").addEventListener(
	// 	'pointerup',doneEditingParams_listener,false)
	// document.querySelector("button[id=doneTestingTask]").addEventListener(
	// 	'pointerup',doneTestingTask_listener,false)
	// document.querySelector("button[id=stressTest]").addEventListener(
	// 	'touchstart',stressTest_listener,false)
	// document.querySelector("button[id=gridPoints]").addEventListener(
	// 	'touchstart',gridPoints_listener,false)

	// 	//---- for Safari
	// 	document.querySelector("button[id=doneEditingParams]").addEventListener(
	// 		'click',doneEditingParams_listener,false)
	// 	document.querySelector("button[id=doneTestingTask]").addEventListener(
	// 		'click',doneTestingTask_listener,false)
	// 	document.querySelector("button[id=stressTest]").addEventListener(
	// 		'click',stressTest_listener,false)
	// 	document.querySelector("button[id=gridPoints]").addEventListener(
	// 		'click',gridPoints_listener,false)
  // 	//---- (END) for Safari
  
  document.querySelector("button[id=doneEditingParams]")
    .addEventListener('pointerup', doneEditingParams_listener, false);
  document.querySelector("button[id=doneTestingTask]")
    .addEventListener('pointerup', doneTestingTask_listener, false);
  document.querySelector("button[id=stressTest]")
    .addEventListener('touchstart', stressTest_listener, false);
  document.querySelector("button[id=gridPoints]")
    .addEventListener('touchstart', gridPoints_listener, false);

	//---- for Safari
  document.querySelector("button[id=doneEditingParams]")
    .addEventListener('click', doneEditingParams_listener, false);
  document.querySelector("button[id=doneTestingTask]")
    .addEventListener('click', doneTestingTask_listener, false);
  document.querySelector("button[id=stressTest]")
    .addEventListener('click', stressTest_listener, false);
  document.querySelector("button[id=gridPoints]")
    .addEventListener('click', gridPoints_listener, false);
  //---- (END) for Safari


	//====================== Retrieve device's screen properties ===========================//
	ENV.UserAgent = window.navigator.userAgent
	ENV.DeviceScreenWidth = window.screen.width
	ENV.DeviceScreenHeight = window.screen.height

	var deviceProperties = await deviceDetect()
	ENV.DeviceType = deviceProperties.data.device.type
	ENV.DeviceBrand = deviceProperties.data.device.brand
	ENV.DeviceName = deviceProperties.data.device.model
	ENV.DeviceGPU = deviceProperties.data.gpu.renderer
	ENV.DeviceBrowserName = deviceProperties.data.client.name
	ENV.DeviceBrowserVersion = deviceProperties.data.client.version
	ENV.DeviceOSName = deviceProperties.data.os.name
	ENV.DeviceOSVersion = deviceProperties.data.os.version
	ENV.DeviceTouchscreen = deviceProperties.data.touchscreen

	var screenSpecs = await queryDeviceonFirestore(ENV.DeviceName);
	//if device not identified by deviceAPI or no matching firestore devices record found for an identified device
	if (screenSpecs.screenSizeInches < 0 && ENV.DeviceType == "desktop") {
		var screenSpecs = await queryDeviceonFirestore('32ul750'); //default to desktop monitor
		console.log('Desktop detected, defaulting to LG 32ul750 monitor for screen ppi');
	} else if (screenSpecs.screenSizeInches < 0 && ENV.DeviceType == "tablet") {
		var screenSpecs = await queryDeviceonFirestore('pixel c'); //default to pixel c
		console.log('Tablet detected, defaulting to pixel c tablet for screen ppi');
	} else if (screenSpecs.screenSizeInches < 0 && ENV.DeviceType == "mobile") {
		var screenSpecs = await queryDeviceonFirestore('pixel 4 xl'); //default to pixel 4 xl
		console.log('Mobile detected, defaulting to pixel 4 xl phone for screen ppi');
  }	else if (
    screenSpecs.screenSizeInches < 0
    && (ENV.DeviceType == "Not available" || ENV.DeviceType == '')
  ) {
		var screenSpecs = await queryDeviceonFirestore('pixel c'); //default to pixel c
		console.log('Device type unidentified, defaulting to pixel c tablet for screen ppi');
	}

	ENV.ScreenSizeInches = screenSpecs.screenSizeInches;
	ENV.ScreenPhysicalPixels = screenSpecs.screenPhysicalPixels; //display pixels (<= physical screen pixels)
	ENV.ScreenRatio = screenSpecs.screenRatio; //scaling from physical pixels to display pixels (retina display)
	ENV.PhysicalPPI = screenSpecs.ppi; //physical device pixels per inch

	if (window.innerWidth < window.innerHeight) {
		ENV.ScreenSizeInches = (
      [ENV.ScreenSizeInches[1], ENV.ScreenSizeInches[0], ENV.ScreenSizeInches[2]]
    );
		ENV.ScreenPhysicalPixels = [ENV.ScreenPhysicalPixels[1], ENV.ScreenPhysicalPixels[0]];
	} //IF PORTRAIT flip horizontal and vertical

	if (ENV.DevicePixelRatio != ENV.ScreenRatio) {
		console.log("User is not running screen at native pixelratio which affects image scaling, will attempt to compensate");
	} //IF user not running screen at native scaling

	ENV.ViewportPixels[0] = ENV.ScreenPhysicalPixels[0] / ENV.DevicePixelRatio;
	ENV.ViewportPixels[1] = ENV.ScreenPhysicalPixels[1] / ENV.DevicePixelRatio;		

	ENV.ViewportPPI = ENV.ViewportPixels[0] / ENV.ScreenSizeInches[0]; //viewport pixels per inch
	updateHeadsUpDisplay()
	//====================== (END) Retrieve device's screen properties ===========================//

  if (ENV.WebUSBAvailable) {
		var event = {};
		event.type = "AutoConnect";
		await findUSBDevice(event);
  }

	//====================== Quickload Button Set-up ===========================//
	// GET PARAMFILE NAME
  var subjectlistobj = document.getElementById("subjectID_select");

  for (let i = subjectlist.length - 1; i >= 0; i--) {
    let opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = subjectlist[i];
    subjectlistobj.appendChild(opt);
  }
	
	subjectlistobj.addEventListener("change", subjectlist_listener, false);
  subjectlistobj.style.visibility = "visible";
  
  if (localStorage.getItem('Agent') != null) { // IF agent stored locally, show quickload button
    QuickLoad.agent = localStorage.getItem('Agent');
    QuickLoad.connectusb = localStorage.getItem('ConnectUSB');

    if (QuickLoad.connectusb == null) {
      QuickLoad.connectusb = 0;
    }

    document.querySelector('button[id=quickload]').style.display = 'block';
    document.querySelector('button[id=quickload]').style.visibility = 'visible';

    if (QuickLoad.connectusb == 0) {
			document.querySelector("button[id=quickload]").innerHTML = QuickLoad.agent;
		} else if (QuickLoad.connectusb == 1) {
			document.querySelector("button[id=quickload]").innerHTML = QuickLoad.agent + " <i>USB</i>";
		}
  } else { // ELSE don't show button
    document.querySelector("button[id=quickload]").style.display = 'none';
  }
	//====================== (END) Quickload Set-up ===========================//

  //================== AWAIT LOAD SUBJECT PARAMS ==================//
	document.querySelector("div[id=subjectID_div]").style.display = "block";
	document.querySelector("div[id=subjectID_div]").style.visibility = "visible";
	await subjectIDPromise();
	document.querySelector("button[id=quickload]").style.display = "none";
	document.querySelector("div[id=subjectID_div]").style.display = "none";

	localStorage.setItem("Agent",ENV.Subject)	;

	ENV.ParamFileName = PARAM_DIRPATH + ENV.Subject + "_params.json";
	await loadParametersfromFirebase(ENV.ParamFileName);
	
	let rtdbAgentRef = rtdb.ref('agents/' + ENV.Subject);
	let rtdbAgentConnectionRef = rtdb.ref(`agents/${ENV.Subject}/numConnections`);
	FLAGS.rtdbDataRef = rtdb.ref('data/' + ENV.Subject);
  //================== (END) AWAIT LOAD SUBJECT PARAMS ==================//


	//====================== Connect USB ===========================//
	// if ( ENV.WebUSBAvailable ){

	// 	if (typeof(port.connected) == 'undefined' || port.connected == false){
	// 		var event = {}
	// 		event.type = "AutoConnect"
	// 		await findUSBDevice(event)
	// 	}

	// 	if ( (typeof(port.connected) == 'undefined' || port.connected == false) &&
	// 	     (QuickLoad.load == 0 || (QuickLoad.load == 1 && QuickLoad.connectusb == 1))){
	// 		//=============== AWAIT CONNECT TO HARDWARE (via USB) ===============//
	// 		port.connected = false
	// 		document.querySelector("button[id=connectusb]").style.display = "block"
	// 		document.querySelector("button[id=connectusb]").style.visibility = "visible"
	// 		document.querySelector("button[id=nousb]").style.display = "block"
	// 		document.querySelector("button[id=nousb]").style.visibility = "visible"

	// 		await connectHardwareButtonPromise()
	// 	} //IF !QuickLoad.load

	// 	document.querySelector("button[id=connectusb]").style.display = "none"
	// 	document.querySelector("button[id=nousb]").style.display = "none"
	// }
	// else {
	// 	//skip usb device connection
	// 	port={
	// 	  statustext_connect: "",
	// 	  statustext_sent: "",
	// 	  statustext_received: "",
	// 	  connected: false
	// 	}
  // }
  
	if (ENV.WebUSBAvailable) {
		if (
      typeof(port.connected) == 'undefined'
      || port.connected == false
    ) {
			var event = {};
			event.type = "AutoConnect";
			await findUSBDevice(event);
		}

		if (
      (typeof(port.connected) == 'undefined' || port.connected == false)
      && (
        QuickLoad.load == 0
        || (QuickLoad.load == 1 && QuickLoad.connectusb == 1)
      )
    ) {
			//=============== AWAIT CONNECT TO HARDWARE (via USB) ===============//
			port.connected = false;
			document.querySelector("button[id=connectusb]").style.display = "block";
			document.querySelector("button[id=connectusb]").style.visibility = "visible";
			document.querySelector("button[id=nousb]").style.display = "block";
			document.querySelector("button[id=nousb]").style.visibility = "visible";

			await connectHardwareButtonPromise();
		} //IF !QuickLoad.load

		document.querySelector("button[id=connectusb]").style.display = "none";
    document.querySelector("button[id=nousb]").style.display = "none";
    
	} else {
		//skip usb device connection
		port = {
		  statustext_connect: "",
		  statustext_sent: "",
		  statustext_received: "",
		  connected: false
		};
	}
	//====================== (END) Connect USB ===========================//

	if (ENV.WebBluetoothAvailable == 0){
		blescale = {
			connected: 0,
			statustext_connect: "",
			statustext_sent: "",
			statustext_received: "",
		};
		ble = {
			connected: 0,
		};
	}

	//================== AWAIT USER CAN EDIT SUBJECT PARAMS ==================//
	if (QuickLoad.load == 0) {
		updateStatusText(JSON.stringify(TASK, null, ' '));
    document.querySelector("p[id=headsuptext]").setAttribute("contentEditable", true);
		document.querySelector("button[id=doneEditingParams]").style.display = "block";
		document.querySelector("button[id=doneEditingParams]").style.visibility = "visible";

		await editParamsPromise();
		document.querySelector("button[id=doneEditingParams]").style.display = "none";
		var textobj = document.getElementById("headsuptext");
		textobj.removeEventListener('touchend', headsuptext_listener);
		textobj.removeEventListener('mouseup', headsuptext_listener);
    document.querySelector("p[id=headsuptext]").setAttribute("contentEditable", false);

		if (FLAGS.need2saveParameters == 1) {
			var user_param_text = document.getElementById("headsuptext").innerHTML; //get new params
			await saveParameterTexttoFirebase(user_param_text); //write new params
			await loadParametersfromFirebase(ENV.ParamFileName); //then read them
		} //IF 
	} //IF !QuickLoad.load
  //================== (END) AWAIT USER CAN EDIT SUBJECT PARAMS ==================//

  // //======================== CHECK IF FIRST NEED TO SAVE OUT IMAGE BAGS ==========================//
  // if (TASK.Agent != "SaveImages"){
	 //  var needsImageBag = []
	 //  var needsImageBagStr = ''
	 //  for (var i=0; i<=TASK.ImageBagsSample.length-1; i++){
		// scenebag = TASK.ImageBagsSample[i]
		// scenebag_dir = scenebag.slice(0,scenebag.lastIndexOf('/')+1)
		// // var filelist = await getFileListRecursiveFirebase(scenebag_dir)
		// var fileList = await storage.ref().child(scenebag_dir).listAll()
		// needsImageBag[i] = 1
		// for (var j=0; j<=fileList.prefixes.length-1; j++){
		// 	var containsSceneBagName = fileList.prefixes[j].name.indexOf(scenebag)
		// 	if (containsSceneBagName >= 0){
		// 		needsImageBag[i] = 0
		// 	}//IF found imagebag folder
		// }//FOR j folders
		// if (needsImageBag[i] == 1){
		// 	needsImageBagStr = needsImageBagStr + "<br>"
		// 					+ "Scene bag <b><i><font color=yellow>" + scenebag + "</font color></b></i> needs an image bag"
		// }
	 //  }//FOR i scenebag files
	 //  if (needsImageBagStr != ''){
		// var textobj = document.getElementById("headsuptext");
		// textobj.innerHTML = needsImageBagStr + "<br><br><b><font color=red> !!! PLEASE SAVE OUT IMAGES FIRST, THEN RELOAD TASK !!! <font color></b>"
		// return
	 //  }//IF needsImageBagStr
  // }//IF !SaveImages
	// //===================== (END) CHECK IF FIRST NEED TO SAVE OUT IMAGE BAGS =======================//
	
  // =================== LOAD MKMODELS IF SPECIES = MODEL =================//
	let mkm;
	if (TASK.Species == 'model') {
		mkm = new MkModels();
		let fromTFHub = TASK.ModelConfig.modelURL.includes('tfhub');
		await mkm.loadFeatureExtractor(TASK.ModelConfig.modelURL, { fromTFHub: fromTFHub });
		let cvs = document.getElementById('model-canvas');
		mkm.bindCanvasElement(cvs);
		mkm.buildClassifier(TASK.ModelConfig);
	}
  // ======================== (END) LOAD MKMODELS ========================//


  //============= AWAIT READ SUBJECT PERFORMANCE HISTORY =============//
	// Read performance history
	var subject_behavior_save_directory = DATA_SAVEPATH + ENV.Subject + '/';
	if (TASK.Automator != 0) {
		var history_file_paths = (
      await getMostRecentBehavioralFilePathsFromFirebase(
        ndatafiles2read,
        ENV.Subject,
        subject_behavior_save_directory,
      )
    );
		trialhistory = await readTrialHistoryFromFirebase(history_file_paths);		
	}

	//===================== AWAIT INITIALIZE AUTOMATOR =================//
	// Initialize automator - change TASK to that specified by TASK.CurrentAutomatorStage. 
	var num_prebuffer_trials = 200;
	if (TASK.Automator != 0) {
		automator_data = await loadTextfromFirebase(TASK.AutomatorFilePath);
		automateTask(automator_data, trialhistory);
		await saveParameterstoFirebase();
		await loadParametersfromFirebase(ENV.ParamFileName);
	}//IF TASK.Automator != 0

	//============= AWAIT LOAD SOUNDS =============//
	soundpromises = sounds.serial.map(loadSoundfromFirebase); //create array of sound load Promises
	await Promise.all(soundpromises); //simultaneously evaluate array of sound load promises
	updateStatusText("");

  //============= AWAIT ESTIMATE SCREEN REFRESH RATE =========//
  var fps = await estimatefps();
  ENV.FrameRateDisplay = fps;
  ENV.FrameRateMovie = fps / 2;

	//========= Start in TEST mode =======//
	document.querySelector("button[id=googlesignin]").style.display = "none"; //if do style.visibility=hidden, element will still occupy space
	document.querySelector("button[id=reloadpage]").style.display = "block";
	document.querySelector("button[id=reloadpage]").style.visibility = "visible";

	document.querySelector("button[id=doneTestingTask]").style.display = "block";
	document.querySelector("button[id=doneTestingTask]").style.visibility = "visible";
	document.querySelector("button[id=gridPoints]").style.display = "block";
	document.querySelector("button[id=gridPoints]").style.visibility = "visible";

	FLAGS.need2loadParameters = 1;
	FLAGS.need2loadScenes = 1;
	CURRTRIAL.num = 0;
	EVENTS.trialnum = 0;
  FLAGS.savedata = 0; // test trials can be performed, but data won't be saved
	
	// await mkmodels.loadFeatureExtractor('https://tfhub.dev/google/tfjs-model/imagenet/resnet_v2_50/feature_vector/3/default/1');

// =========================================================================================================== // 
// ============ MAIN LOOP ==================================================================================== // 
// =========================================================================================================== // 
  while(true){

	//============= AWAIT LOAD PARAMS =============//
    if (FLAGS.need2loadParameters == 1) {
      FLAGS.need2loadParameters = await loadParametersfromFirebase(ENV.ParamFileName);

      if (TASK.Agent == "SaveImages") { 
        document.querySelector("button[id=stressTest]").innerHTML = "Save Images";
        TASK.SamplingStrategy = "sequential";
        console.log("Automatically using sequential sampling since SAVE IMAGES was specified.");
      }//IF SaveImages

      if (typeof(TASK.DragtoRespond) == 'undefined') {
        if (FLAGS.trackeye == 0) { // IF touch, then only clicking
          TASK.DragtoRespond = 0; // click in box
        } else if (FLAGS.trackeye != 0) { // ELSE IF eyetracker, allow dragging
          TASK.DragtoRespond = 1; // drag into box
        }
      }

      //load previous calibration if available
      if (FLAGS.trackeye > 0){ // IF trackeye
        //Calibration
        ENV.Eye.calibration = 0;
        ENV.Eye.CalibXTransform = [];
        ENV.Eye.CalibYTransform = [];
        ENV.Eye.CalibType = 'default';
        ENV.Eye.NCalibPointsTrain = 0;
        ENV.Eye.NCalibPointsTest = 0;
        ENV.Eye.CalibTrainMSE = [];
        ENV.Eye.CalibTestMSE = [];
  
        await loadEyeCalibrationfromFirestore(ENV.Subject);

        if (ENV.Eye.CalibXTransform.length == 0) { // Default calibration
  
          var xrange = 0.5;
          var yrange = 0.5;
          var xscale = ENV.ViewportPixels[0] / xrange;
          var yscale = ENV.ViewportPixels[1] / yrange;
  
          ENV.Eye.CalibXTransform = [xscale, 0, -(0.5 - xrange/2)*xscale]
          ENV.Eye.CalibYTransform = [
            0,
            -yscale,
            ENV.ViewportPixels[1] + (0.5 - yrange / 2 ) * yscale,
          ];
  
          // ENV.Eye.CalibXTransform = [ 1, 0, 0]
          // ENV.Eye.CalibYTransform = [ 0, 1, 0]
  
          saveEyeCalibrationtoFirestore(
            ENV.Eye.CalibXTransform,
            ENV.Eye.CalibYTransform,
            ENV.Eye.NCalibPoints,
            ENV.Eye.CalibType,
          );

        }

        // will calibrate using TASK.CalibrateEye number of trials for train & same number for test
        if (TASK.CalibrateEye > 0) { // IF CalibrateEye
          ENV.Eye.calibration = 1;
          ENV.Eye.NCalibPointsTrain = 0;
          ENV.Eye.NCalibPointsTest = 0;
          ENV.Eye.CalibTrainMSE = [];
          ENV.Eye.CalibTestMSE = [];
        }

      }

      //============= SET UP CANVAS =============//
      // Update canvas based on latest TASK state: 
      refreshCanvasSettings(TASK); 
      setupCanvasHeadsUp();
      setupImageLoadingText();
      windowWidth = document.body.clientWidth; //get true window dimensions at last possible moment
      windowHeight = document.body.clientHeight;
      setupCanvas(VISIBLECANVAS);

      //Foreground canvas that displays eye position during practice screen
      setupEyeTrackerCanvas();

      if (ENV.DevicePixelRatio !== 1) {
        scaleCanvasforHiDPI(VISIBLECANVAS);
        scaleCanvasforHiDPI(EYETRACKERCANVAS);
      }
      
      if (ENV.OffscreenCanvasAvailable) {
        OFFSCREENCANVAS = new OffscreenCanvas(VISIBLECANVAS.width, VISIBLECANVAS.height);
        OFFSCREENCANVAS.commitTo = (dest) => {
          try {
            let bitmap = OFFSCREENCANVAS.transferToImageBitmap();
            dest.transferFromImageBitmap(bitmap);
            return { status: 'succeeded' };
          } catch (e) {
            console.error('[OFFSCREENCANVAS.commitTo] Error:', e);
            return { status: 'failed' };
          }
        }
        // OFFSCREENCANVAS.commitTo = function(dest) {
        //   try {
        //     var bitmap = this.transferToImageBitmap()
        //     dest.transferFromImageBitmap(bitmap)
        //     str = {status: "succeeded"}
        //     return str
        //   }
        //   catch(error){
        //     console.log(error)
        //     str = {status: "failed"}
        //     return str				
        //   }
        // }
      } else {
        OFFSCREENCANVAS = VISIBLECANVAS;
      }

      CANVAS.workspace = [
        0,
        0,
        VISIBLECANVAS.width,
        VISIBLECANVAS.height
      ];

      TQS = undefined;
      FLAGS.need2loadScenes = 1; 

      //Determine task type
      if (TASK.RewardStage == 0) {
        ENV.Task = "FIXATION"
      } else if (TASK.RewardStage == 1) { // IF Task.RewardStage
        if (TASK.NRSVP > 0) {
          ENV.Task = 'RSVP';
        } else if (TASK.SameDifferent > 0 && TASK.ChoiceGridIndex.length == 2) { // Task is SameDifferent
          // Same-Different (SD)
          ENV.Task = 'SD';
        } else if (TASK.ObjectGridIndex.length == TASK.ImageBagsSample.length) { // Task is Stimulus-Response
          // Stimulus-Response (SR)
          ENV.Task = 'SR';
        } else { // Task is Match-to-Sample
          // Match-to-Sample
          ENV.Task = 'MTS';
        }
      }

      //Size of Fixation screen circle or image
      ENV.FixationRadius = TASK.FixationSizeInches / 2 * ENV.ViewportPPI;
  
      //Size of Choice screen circle or square
      ENV.ChoiceRadius = TASK.ChoiceSizeInches / 2 * ENV.ViewportPPI;
  
      //Fixation dot, if >0, will appear on both fixation & sample screens
      ENV.FixationDotRadius = TASK.FixationDotSizeInches / 2 * ENV.ViewportPPI;
  
      //Fixation window, if specified, operates on both fixation & sample screens
      ENV.FixationWindowRadius = TASK.FixationWindowSizeInches / 2 * ENV.ViewportPPI;

      // define image display grid
      funcreturn = defineImageGrid(
        TASK.NGridPoints,
        TASK.GridSpacingInches * ENV.ViewportPPI,
        TASK.GridXOffsetInches * ENV.ViewportPPI,
        TASK.GridYOffsetInches * ENV.ViewportPPI,
      );
      xcanvascenter = funcreturn[0];
      ycanvascenter = funcreturn[1];
      ENV.XGridCenter = funcreturn[2];
      ENV.YGridCenter = funcreturn[3];

      FLAGS.purge = 1;
      FLAGS.createnewfirestore = 1;
      CURRTRIAL.reset();
      EVENTS.reset_trialseries();
      EVENTS.reset_timeseries();
    } //IF need2loadParameters

    if (FLAGS.purge == 1) {
      purgeTrackingVariables();
      FLAGS.purge = 0; 
    } //IF purge


    //======================== 3D SCENE SET-UP =======================//
    if (FLAGS.need2loadScenes) {
      IMAGES = { Sample: [], Test: [] };
      IMAGEMETA = {};
      // STEPS FOR 3D SCENE SET-UP
      // ---- 0: load scene params from JSON
      // 0: expand trial params & get mesh paths
      // ---- 1: load meshes
      // ---- 2: init scene & camera
      // ---- 3: add all lights & objects
      // ---- 4: compile shaders
      // 5: select frame to render
      // 5: animate <--> render loop within trial

      //============ 0: LOAD SCENES from JSON ============//
      for (let i = 0; i < TASK.ImageBagsSample.length; i++) {
        IMAGES.Sample[i] = await loadTextfromFirebase(TASK.ImageBagsSample[i]);
      }

      for (let i = 0; i < TASK.ImageBagsTest.length; i++) {
        IMAGES.Test[i] = await loadTextfromFirebase(TASK.ImageBagsTest[i]);
      }

      // find the longest scene param arry in IMAGES (ie # of trials)
      for (let i = 0; i < IMAGES.Sample.length; i++) {
        IMAGES.Sample[i].nimages = getLongestArray(IMAGES.Sample[i]);
        IMAGES.Test[i].nimages = getLongestArray(IMAGES.Test[i]);

        //Determine if images will also be rendered
			  IMAGES.Sample[i].nbackgroundimages = IMAGES.Sample[i].IMAGES.imageidx.length;
        IMAGES.Test[i].nbackgroundimages = IMAGES.Test[i].IMAGES.imageidx.length;
        
        FLAGS.movieper['Sample'][i] = [];
        FLAGS.movieper['Test'][i] = [];
      }
      //============ (END) 0: LOAD SCENES from JSON ============//

      //============ 1: LOAD MESHES FOR SCENES ============//
      OBJECTS = { Sample: {}, Test: {} };
      for (let taskscreen in OBJECTS) {
        let meshPaths = [];
        let meshIdxs = [];

        for (let classLabel = 0; classLabel < IMAGES[taskscreen].length; classLabel++) {
          for (const obj in IMAGES[taskscreen][classLabel].OBJECTS) {
            meshPaths.push(IMAGES[taskscreen][classLabel].OBJECTS[obj].meshpath);
            meshIdxs.push([classLabel, obj]); 
          }
        }

        let meshes = await loadMeshArrayfromFirebase(meshPaths);

        // FOR i meshes, initialize corresponding label to an empty array
        for (let i = 0; i < meshes.length; i++) {
          let meshLabel = meshIdxs[i][0];
          OBJECTS[taskscreen][meshLabel] = { meshes: [] };
        }

        // For i meshes, store in corresponding labels
        for (let i = 0; i < meshes.length; i++) {
          let meshLabel = meshIdxs[i][0];
          let meshName = meshIdxs[i][1];
          OBJECTS[taskscreen][meshLabel].meshes[meshName] = meshes[i];
        }
      }
      //============ (END) 1: LOAD MESHES FOR SCENES ============//


      //============ 2: INIT SCENE & CAMERA ============//
      setupCanvas(VISIBLECANVASWEBGL);
		  await initThreeJS(IMAGES);
      //============ (END) 2: INIT SCENE & CAMERA ============//

      //============ 3: ADD ALL LIGHTS/OBJECTS TO SCENE ============//
	    CAMERAS = { Sample: {}, Test: {} };
	    LIGHTS = { Sample: {}, Test: {} };
		  for (let scenetype in scene) {
			  await addToScene(scenetype);
		  } 
		  console.log('3js: added lights & objects');
      //============ (END) 3: ADD ALL LIGHTS/OBJECTS TO SCENE ============//

   		//============ 4: PRELOAD SHADERS (COMPILE) ============//
       for (let scenetype in scene) {
        renderer.compile(
          scene[scenetype],
          scene[scenetype].getObjectByName('cam0')
        );
      }
      console.log('3js: compiled scene')
      //============ (END) 4: PRELOAD SHADERS (COMPILE) ============//
       
      FLAGS.need2loadScenes = 0;

      // Make a scene trial queue TQS (overrides TQ)
      TQS = new TrialQueueScene(TASK.SamplingStrategy);
      await TQS.build(num_prebuffer_trials);

      // Store scene metadata
      let sampleSceneMeta = (
        objectomeSceneNamesToLatentVars(
          TASK.ImageBagsSample,
          TQS.testbag_labels,
          IMAGES.Sample
        )
      );
      let sampleSceneMetaKeys = Object.keys(sampleSceneMeta);
      for (let i = 0; i < sampleSceneMetaKeys.length; i++) {
        IMAGEMETA['Sample' + sampleSceneMetaKeys[i]] = sampleSceneMeta[sampleSceneMetaKeys[i]];
      }

      let testSceneMeta = (
        objectomeSceneNamesToLatentVars(
          TASK.ImageBagsTest,
          TQS.testbag_labels,
          IMAGES.Test
        )
      );
      let testSceneMetaKeys = Object.keys(testSceneMeta);
      for (let i = 0; i < testSceneMetaKeys.length; i++) {
        IMAGEMETA['Test' + testSceneMetaKeys[i]] = testSceneMeta[testSceneMetaKeys[i]];
      }
    }

    if (typeof(TASK.BackgroundColor2D) == 'undefined') {
      TASK.BackgroundColor2D = '#7F7F7F';
    }
    document.body.style.background = TASK.BackgroundColor2D;
    //========================(END) 3D SCENE SET-UP =======================//


    //============ SELECT SAMPLE & TEST IMAGES ============//

    let imgSeqLen = (
      (typeof(TASK.NRSVP) == 'undefined' || TASK.NRSVP <= 0) ? 1 : TASK.NRSVP
    );

    for (let i = 0; i < imgSeqLen; i++) {
      let x = await TQS.get_next_trial();
      CURRTRIAL.sampleimage[i] = x[0];
      CURRTRIAL.sampleindex[i] = x[1];

      // Sample can have multiple sequential scenes (items are over time; eg, RSVP)
      CURRTRIAL.sampleindex_nonarray[i] = x[1][0];
      CURRTRIAL.sample_scenebag_label[i] = x[5];
      CURRTRIAL.sample_scenebag_index[i] = x[6];

      // Test can have multiple simultaneous scenes (items are over space; ev, MtS)
      if (i == 0) { // IF first image
        CURRTRIAL.testimages[i] = x[2];
        CURRTRIAL.testindices[i] = x[3]
        CURRTRIAL.test_scenebag_labels[i] = x[7]
        CURRTRIAL.test_scenebag_indices[i] = x[8]
        CURRTRIAL.correctitem = x[4]
        samplereward = x[9]
      }
    }

    logEVENTS("Sample", CURRTRIAL.sampleindex_nonarray, "trialseries");
    logEVENTS("Test", CURRTRIAL.testindices[0], "trialseries");
    //============(END) SELECT SAMPLE & TEST IMAGES ============//

    //============ SET UP SAMPLE & TEST SEQUENCE ============//
    // when & where to display
    CURRTRIAL.tsequence = [0];
    CURRTRIAL.sequencegridindex = [[-1]];

    // what to display
    CURRTRIAL.sequenceclip = [-1]; //movieclip# in RSVP
    CURRTRIAL.sequenceframe = [-1]; //frame# in movie
    CURRTRIAL.sequencetaskscreen = ['blank'];
    CURRTRIAL.sequencelabel = [[0]]; //image class
    CURRTRIAL.sequenceindex = [[0]]; //image index

    //EXPAND SAMPLE (for rsvp & movies)
    //Start with blank for max(100,SampleOFF), then append SampleON+blank (eg, blank,Sample,blank,Sample,blank)
    for (var i=0; i<=CURRTRIAL.sample_scenebag_index.length-1; i++){
        var t0=CURRTRIAL.tsequence[CURRTRIAL.tsequence.length-1]
        var sampleon = chooseArrayElement(IMAGES["Sample"][CURRTRIAL.sample_scenebag_label[i][0]].durationMS, CURRTRIAL.sample_scenebag_index[i][0],0)

        //Timing: blankdurationpre, sampleon, framerate
        if (i==0){
            var blankdurationpre = Math.max(100,TASK.SampleOFF)
        }//if first blank, prepend at least 100ms
        else{
            var blankdurationpre = TASK.SampleOFF
        }

        //Create Movie Sequence
        [movie_sequence, movie_tsequence, movie_framenum] = 
        createMovieSeq("Sample",blankdurationpre, sampleon, TASK.SampleOFF, ENV.FrameRateMovie)
        movie_tsequence = movie_tsequence.map(function (a){return a + t0}) //shift clip's frames to absolute position in rsvp sequence

        CURRTRIAL.tsequence.push(...movie_tsequence)
        CURRTRIAL.sequencegridindex.push(...Array(movie_tsequence.length).fill([TASK.SampleGridIndex]))

        CURRTRIAL.sequenceclip.push(...Array(movie_tsequence.length).fill(i))
        CURRTRIAL.sequenceframe.push(...movie_framenum)
        CURRTRIAL.sequencetaskscreen.push(...movie_sequence)
        CURRTRIAL.sequencelabel.push(...Array(movie_tsequence.length).fill(CURRTRIAL.sample_scenebag_label[i]))
        CURRTRIAL.sequenceindex.push(...Array(movie_tsequence.length).fill(CURRTRIAL.sample_scenebag_index[i]))
    }//FOR i RSVP Sample

    //APPEND TEST OR CHOICE
    if (TASK.NRSVP <= 0){
        var t0 = CURRTRIAL.tsequence[CURRTRIAL.tsequence.length-1]
        var teston = chooseArrayElement(IMAGES["Test"][CURRTRIAL.test_scenebag_labels[0][0]].durationMS, CURRTRIAL.test_scenebag_indices[0][0],0)

if (typeof(teston) == "undefined"){
    console.log("Without this if, then print-to-console code, teston is undefined. Not clear why this strange behavior happens. Something to do with chooseArrayElement returning in time.")
}
        [movie_sequence, movie_tsequence, movie_framenum] = 
            createMovieSeq("Test",TASK.SampleOFF, teston, TASK.TestOFF, ENV.FrameRateMovie)
        movie_tsequence = movie_tsequence.map(function (a){return a + t0}) //shift frames to absolute position in sequence

        CURRTRIAL.tsequence.push(...movie_tsequence)
        CURRTRIAL.sequencegridindex.push(...Array(movie_tsequence.length).fill(TASK.TestGridIndex))

        CURRTRIAL.sequenceclip.push(...Array(movie_tsequence.length).fill(0))
        CURRTRIAL.sequenceframe.push(...movie_framenum)
        CURRTRIAL.sequencetaskscreen.push(...movie_sequence)
        CURRTRIAL.sequencelabel.push(...Array(movie_tsequence.length).fill(CURRTRIAL.test_scenebag_labels[0]))
        CURRTRIAL.sequenceindex.push(...Array(movie_tsequence.length).fill(CURRTRIAL.test_scenebag_indices[0]))

        //Append choice if needed
        if (TASK.SameDifferent > 0){
            var t0 = CURRTRIAL.tsequence[CURRTRIAL.tsequence.length-1]
            if (TASK.TestOFF > 0){
                var seq=["blank","choice"]
                var tseq=[ t0,t0+TASK.TestOFF ];
            }//ELSEIF TestOFF
            else if (TASK.TestOFF <= 0){
                var seq=["choice"]
                var tseq=[ t0 ];
            }//ELSEIF no TestOFF
            CURRTRIAL.tsequence.push(...tseq)
            CURRTRIAL.sequencegridindex.push(...Array(tseq.length).fill(TASK.ChoiceGridIndex))

            CURRTRIAL.sequenceclip.push(...Array(tseq.length).fill(0))
            CURRTRIAL.sequenceframe.push(...Array(tseq.length).fill(0))
            CURRTRIAL.sequencetaskscreen.push(...seq)
            CURRTRIAL.sequencelabel.push(...Array(tseq.length).fill([0]))
            CURRTRIAL.sequenceindex.push(...Array(tseq.length).fill([0]))
        }//IF Same-Different, show test & choice
    }//IF !RSVP, then show test/choice screen
//============(END) SET UP SAMPLE & TEST SEQUENCE ============//


	//================= RFID check =================//
	// If no matching read in the last TASK.CheckRFID seconds, wait for matching read
	// (kicks-them-off model where they can work as long as reading, but then get kicked off within TASK.CheckRFID seconds if they are the wrong agent or no reads)
	if (TASK.CheckRFID > 0 && ENV.AgentRFID != "XX" && FLAGS.savedata == 1){
		if (port.connected == false){
			console.log('NO USB DEVICE CONNECTED: cannot check RFID!!')
		}//IF !connected
		else if (port.connected == true){
			var nreads = Object.keys(EVENTS['timeseries']['RFIDTag']).length
	    	if ( nreads>0 && EVENTS['timeseries']['RFIDTag'][nreads-1][2] == ENV.AgentRFID && 
                    Date.now() - new Date(EVENTS['timeseries']['RFIDTag'][nreads-1][1]) < TASK.CheckRFID
                ){
	    		// RFID checks out
	    	}
	    	else{ //wait for a recent rfid read before proceeding with next trial
				await rfid_promise(ENV.AgentRFID,TASK.CheckRFID)
	    	}
		}//ELSE connected
	}//IF CheckRFID
	//================= (end) RFID check =================//


// FIXATION   FIXATION   FIXATION   FIXATION   FIXATION   FIXATION   //
// FIXATION   FIXATION   FIXATION   FIXATION   FIXATION   FIXATION   //
// FIXATION   FIXATION   FIXATION   FIXATION   FIXATION   FIXATION   //
//============ WHILE RUN FIXATION SCREEN ============//
	FLAGS.waitingforTouches = TASK.NFixations
	if (TASK.RewardStage == 0){
		FLAGS.punishOutsideTouch = 1		
	}
	CURRTRIAL.allfixationxyt = []
	while (FLAGS.waitingforTouches > 0){
		// Choose fixation grid index at random
		if (TASK.FixationGridIndex > 0){
            CURRTRIAL.fixationgridindex = TASK.FixationGridIndex;
		}
		else if (TASK.FixationGridIndex < 0){
            CURRTRIAL.fixationgridindex = Math.floor((ENV.XGridCenter.length)*Math.random()); 
		}
		logEVENTS("FixationGridIndex",CURRTRIAL.fixationgridindex,"trialseries")

        if (TASK.FixationUsesSample <= 0){
            // Render fixation screen 
            if (TASK.Species == "macaque" || TASK.Species == "human"){
                ENV.FixationColor = "white";
            }
            else if (TASK.Species == "marmoset"){
                ENV.FixationColor = "blue";
            }  
            frame.shown=[]; frame.frames=[]; frame.current=0;
            for (var q in CANVAS.sequencepre){ frame.shown[q]=0; frame.frames[q]=[q]}; 
        }//IF !Sample, show fixation dot
		else if (TASK.FixationUsesSample > 0){
            //Update grid location of sample to current fixation grid index
            frame.shown = []; frame.frames=[]; frame.current=0
            for (var i=0; i<=CURRTRIAL.sequencegridindex.length-1; i++){
                for (var j=0; j<=CURRTRIAL.sequencegridindex[i].length-1; j++){
                    if (CURRTRIAL.sequencetaskscreen[i] == "Sample"){

						//Set location to fixation
						CURRTRIAL.sequencegridindex[i][j] = CURRTRIAL.fixationgridindex
                        
                        if (CURRTRIAL.sequenceclip[i] == 0 && j==0){
                            frame.shown.push(0)
                            frame.frames.push([i])
                        }//IF first clip, add frame
                    }//IF Sample
                }//FOR j display items
            }//FOR i frames
        }//IF Sample, show first image/movie

		// Start timer for this fixation render trial.
		CURRTRIAL.starttime=Date.now() - ENV.CurrentDate.valueOf();
		logEVENTS("StartTime",CURRTRIAL.starttime,"trialseries")

		//========= AWAIT SHOW FIXATION =========//
		// todo: move to appropriate location
		if (TASK.Species == 'marmoset' || TASK.Species == 'model'){
			playSound(0)
		}

        if (TASK.FixationUsesSample <= 0){
            await displayTrial(CANVAS.tsequencepre,[CURRTRIAL.fixationgridindex],[0],
                         CANVAS.sequencepre,[0],[0]) // dispTrial(time,grid,frame,screen,obj,idx)            
        }//IF !Sample, show fixation dot
        else if (TASK.FixationUsesSample > 0){
           displayTrial(CURRTRIAL.tsequence, CURRTRIAL.sequencegridindex, CURRTRIAL.sequenceframe,
                    CURRTRIAL.sequencetaskscreen, CURRTRIAL.sequencelabel, CURRTRIAL.sequenceindex)
			await moviestart_promise()
        }//ELSE Sample, show image/movie

		audiocontext.suspend()

		//========= AWAIT HOLD FIXATION TOUCH =========//
        if (ENV.FixationWindowRadius > 0){
            funcreturn = getFixationWindowBoundingBox(CURRTRIAL.fixationgridindex,ENV.FixationWindowRadius)
            boundingBoxesFixation.x[0] = funcreturn[0];
            boundingBoxesFixation.y[0] = funcreturn[1];
        }//IF fixationWindow, then override object size
        else if (TASK.FixationUsesSample > 0 && ENV.FixationWindowRadius <= 0){
            boundingBoxesFixation = boundingBoxesChoice3D
        }//alternative fixation windows

		if (FLAGS.stressTest == 1){
			if (TASK.Species == 'model') {
				// console.log('MODEL:', CURRTRIAL.num);
				// console.log('Model:',EVENTS['trialseries']['Response'].length);
				let ctx = mkm.cvs.getContext('2d');
				ctx.clearRect(0, 0, mkm.cvs.width, mkm.cvs.height);
				
				var touchhold_return = {type: "theld"};
				// console.log('boundingBoxesFixation:', boundingBoxesFixation);
				let sxOffset = (
					IMAGES.Sample[CURRTRIAL.correctitem].IMAGES.sizeInches
					* ENV.PhysicalPPI / ENV.ScreenRatio
				);
				let sx = (
					boundingBoxesFixation.x[0][1]
					+ boundingBoxesFixation.x[0][0]
					- sxOffset
				);
				sx = Math.round(sx);

				let syOffset = (
					IMAGES.Sample[CURRTRIAL.correctitem].IMAGES.sizeInches
					* ENV.PhysicalPPI / ENV.ScreenRatio - ENV.FixationWindowRadius
				);
				let sy = (
					(boundingBoxesFixation.y[0][1] + boundingBoxesFixation.y[0][0]) 
					/ ENV.ScreenRatio 
					- syOffset
				);
				sy = Math.round(sy);

				let sHeight = Math.round(
					IMAGES.Sample[CURRTRIAL.correctitem].IMAGES.sizeInches
					* ENV.PhysicalPPI
				);
				let sWidth = sHeight;
				
				ctx.drawImage(VISIBLECANVAS, sx, sy, sWidth, sHeight, 0, 0, 224, 224);
				let tensor = mkm.normalizePixelValues(mkm.cvs);
				let feature = mkm.featureExtractor.execute(tensor);
				feature = feature.reshape([2048]);
				if (CURRTRIAL.num <= TASK.ModelConfig.trainIdx) {
					mkm.dataObj.xTrain.push(feature);
					if (CURRTRIAL.correctitem == 0) {
						mkm.dataObj.yTrain.push([1, 0]);
					} else if (CURRTRIAL.correctitem == 1) {
						mkm.dataObj.yTrain.push([0, 1]);
					}
				} else {
					mkm.dataObj.xTest = feature;
					mkm.dataObj.yTest = CURRTRIAL.correctitem;
				}

				if (CURRTRIAL.num == TASK.ModelConfig.trainIdx) {
					// console.log('xTrain len:', mkm.dataObj.xTrain.length);
					let xTrain = tf.data.array(mkm.dataObj.xTrain);
					let yTrain = tf.data.array(mkm.dataObj.yTrain);
					let trainDataset = tf.data.zip({xs: xTrain, ys: yTrain}).batch(4).shuffle(4);

					const beginMs = performance.now();
					await mkm.model.fitDataset(trainDataset, {
						epochs: TASK.ModelConfig.epochs,
						callbacks: {
							onEpochEnd: async(epoch, logs) => {
								const secPerEpoch = (
									(performance.now() - beginMs) / (1000 * (epoch + 1))
								);
								console.log('Training model ... Approx. ' + `${secPerEpoch.toFixed(4)} sec/epoch`);
								console.log('logs:', logs);
							}
						}
					});
				}
				
				// let storageRef = storage.ref();
				// let cvsData = cvs.toDataURL();
				// storageRef.child('mkturkfiles/mkmodels/cvsdata.png').putString(cvsData, 'data_url');


				var x = boundingBoxesFixation.x[0][0] + Math.round(Math.random()*(boundingBoxesFixation.x[0][1] - boundingBoxesFixation.x[0][0]))
				var y = boundingBoxesFixation.y[0][0] + Math.round(Math.random()*(boundingBoxesFixation.y[0][1] - boundingBoxesFixation.y[0][0]))
				touchhold_return.cxyt = [0,x,y,Date.now() - ENV.CurrentDate.valueOf()];
				FLAGS.waitingforTouches--;
			} else {
				var touchhold_return = {type: "theld"}
				var x = boundingBoxesFixation.x[0][0] + Math.round(Math.random()*(boundingBoxesFixation.x[0][1] - boundingBoxesFixation.x[0][0]))
				var y = boundingBoxesFixation.y[0][0] + Math.round(Math.random()*(boundingBoxesFixation.y[0][1] - boundingBoxesFixation.y[0][0]))
				touchhold_return.cxyt = [0,x,y,Date.now() - ENV.CurrentDate.valueOf()]
				FLAGS.waitingforTouches--	
			}
		}//IF automated stress test
		else {
      FLAGS.acquiredTouch = 0;
      var p1 = hold_promise(TASK.FixationDuration,boundingBoxesFixation,FLAGS.punishOutsideTouch);
			var p2 = choiceTimeOut(TASK.FixationTimeOut);
			var touchhold_return = await Promise.race([p1,p2]);
		}//ELSE await fixation hold

		if (FLAGS.movieplaying==1){
			//So that sample movie does not continue playing after fixation acquired
			frame.current = frame.shown.length-1
			frame.shown[frame.current] = 1
			await moviefinish_promise()
		}//IF movie playing

		CURRTRIAL.fixationtouchevent = touchhold_return.type
		CURRTRIAL.fixationxyt = [touchhold_return.cxyt[1], touchhold_return.cxyt[2], touchhold_return.cxyt[3]]
		CURRTRIAL.allfixationxyt[TASK.NFixations - FLAGS.waitingforTouches - 1] = CURRTRIAL.fixationxyt

		logEVENTS("FixationTouchEvent",CURRTRIAL.fixationtouchevent,"trialseries")
		logEVENTS("FixationXYT",CURRTRIAL.fixationxyt,"trialseries")

		if (CURRTRIAL.fixationtouchevent == "theld"){
			if (TASK.RewardStage == 0 && FLAGS.waitingforTouches == 0){
				CURRTRIAL.response = 1
                CURRTRIAL.correctitem = 1
				logEVENTS("Response",CURRTRIAL.response,"trialseries")
			}
		}//IF held fixaton & fixation task, count as correct
		else if (TASK.RewardStage == 0 && CURRTRIAL.fixationtouchevent == "tbroken"){
			CURRTRIAL.response = 0
            CURRTRIAL.correctitem = 1
			FLAGS.waitingforTouches = 0 //exit loop
			logEVENTS("Response",CURRTRIAL.response,"trialseries")
		}//IF broke fixation & fixation task, count as incorrect
		else if ( (CURRTRIAL.fixationtouchevent == "tbroken" && TASK.RewardStage == 1)
              || (CURRTRIAL.fixationtouchevent == "TimeOut")){
        }//IF timed out OR dms task, ok if touched outside, just wait for touch inside fixation area

		//========= AWAIT CLEAR FIXATION =========//
		for (var q in CANVAS.sequenceblank){frame.shown[q]=0; frame.frames[q]=[q] }
		frame.current=0;
		if (FLAGS.waitingforTouches > 0){
			await displayTrial(CANVAS.tsequenceblank,[-1,-1],[0,1],CANVAS.sequenceblank,[0,0],[0,0])
		}//blank out screen
	}//WHILE waiting for NFixations
	//============ (end) WHILE RUN FIXATION SCREEN ============//


//SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    //
//SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    //
//SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    SAMPLE TEST    //
	//============== AWAIT SHOW SAMPLE THEN TEST ==============//
	if (TASK.RewardStage === 1){

        //Set where to display
        if (TASK.SampleGridIndex > 0){
          CURRTRIAL.samplegridindex = TASK.SampleGridIndex;
        }//IF fixed sample location
        else if (TASK.SampleGridIndex < 0){
          if (TASK.FixationGridIndex < 0){
              CURRTRIAL.samplegridindex = CURRTRIAL.fixationgridindex
          }//IF moving fixation, use its grid location for sample
          else {
              CURRTRIAL.samplegridindex = Math.floor((ENV.XGridCenter.length)*Math.random()); 
          }//ELSE use random grid location for sample
        }//ELSE IF random sample location

		//Update grid location of each Sample frame
		for (var i=0; i<=CURRTRIAL.sequencegridindex.length-1; i++){
			for (var j=0; j<=CURRTRIAL.sequencegridindex[i].length-1; j++){
				if (CURRTRIAL.sequencetaskscreen[i] == "Sample"){
					CURRTRIAL.sequencegridindex[i][j] = CURRTRIAL.samplegridindex
				}//IF Sample
			}//FOR j display items
		}//FOR i frames
        
        logEVENTS("SampleGridIndex",CURRTRIAL.samplegridindex,"trialseries")

        frame.shown=[]
        frame.frames=[]
        frame.current=0
        for (var q in CURRTRIAL.sequencetaskscreen){
            frame.shown[q]=0
            frame.frames[q]=[q]
        }//FOR q frames

        //Add KeepSampleON & KeepTestON
        if (TASK.KeepSampleON == 1){
            var indices = []
            var idx = CURRTRIAL.sequencetaskscreen.indexOf("Sample");
            while (idx != -1) {
                indices.push(idx);
                idx = CURRTRIAL.sequencetaskscreen.indexOf("Sample", idx + 1);
            }//WHILE
            for (var i=indices[indices.length-1]+1; i<=frame.frames.length-1; i++){
                frame.frames[i].push(indices[indices.length-1]) //Append last Sample scene rendered
            }//FOR i remaining frames after Sample
        }//IF KeepSampleON

        if (TASK.KeepTestON == 1 && TASK.SameDifferent > 0){
            var indices = []
            var idx = CURRTRIAL.sequencetaskscreen.indexOf("Test");
            while (idx != -1) {
                indices.push(idx);
                idx = CURRTRIAL.sequencetaskscreen.indexOf("Test", idx + 1);
            }//WHILE
            for (var i=indices[indices.length-1]+1; i<=frame.frames.length-1; i++){
                frame.frames[i].push(indices[indices.length-1]) //Append last Test scene rendered
            }//FOR i remaining frames after Test
        }//IF KeepSampleON

        //Display Sample & Test/Choice
        if (TASK.NRSVP>0 && TASK.FixationWindowSizeInches>0){
            funcreturn = getFixationWindowBoundingBox(CURRTRIAL.samplegridindex,ENV.FixationWindowRadius)
            boundingBoxesSampleFixation.x[0] = funcreturn[0]
            boundingBoxesSampleFixation.y[0] = funcreturn[1]
            FLAGS.punishOutsideTouch = 1
            FLAGS.waitingforTouches = 1
            FLAGS.acquiredTouch = 1;
            if (FLAGS.trackeye){
              ENV.Eye.EventType = "eyemove"
            }//IF trackeye
            var p1 = hold_promise(0,boundingBoxesSampleFixation,FLAGS.punishOutsideTouch)
            var p2 = displayTrial(CURRTRIAL.tsequence, CURRTRIAL.sequencegridindex, CURRTRIAL.sequenceframe, CURRTRIAL.sequencetaskscreen, CURRTRIAL.sequencelabel, CURRTRIAL.sequenceindex)
            CURRTRIAL.samplestarttime=Date.now() - ENV.CurrentDate.valueOf();
            CURRTRIAL.samplestarttime_string = new Date(Date.now()).toJSON()
            var race_return = await Promise.race([p1,p2])
            FLAGS.acquiredTouch = 0;
            FLAGS.waitingforTouches = 0

			if (FLAGS.movieplaying==1){
				//So that sample movie does not continue playing after fixation broken
				frame.current = frame.shown.length-1
				frame.shown[frame.current] = 1
				await moviefinish_promise()
			}//IF movie playing

            if (FLAGS.trackeye > 0){
                ENV.Eye.EventType = "eyestart" //Reset eye state
            }//IF TrackEye

            if (typeof(race_return.type) == "undefined"){
                CURRTRIAL.samplefixationtouchevent = 'theld'
                CURRTRIAL.samplefixationxyt = [0,0,Date.now() - ENV.CurrentDate.valueOf()]
            }//IF held samplefixation
            else{
                CURRTRIAL.samplefixationtouchevent = race_return.type
                CURRTRIAL.samplefixationxyt = [race_return.cxyt[1], race_return.cxyt[2], race_return.cxyt[3]]
            }//ELSE broke samplefixation
        }//IF RSVP, hold sample fixation
        else{
			boundingBoxesChoice3D = {'x':[],'y':[]} //determined on the fly during display
	        CURRTRIAL.samplefixationtouchevent = ''
            CURRTRIAL.samplefixationxyt = []
            CURRTRIAL.samplestarttime=Date.now() - ENV.CurrentDate.valueOf();
            CURRTRIAL.samplestarttime_string = new Date(Date.now()).toJSON()            
			await displayTrial(CURRTRIAL.tsequence, CURRTRIAL.sequencegridindex, CURRTRIAL.sequenceframe,
								CURRTRIAL.sequencetaskscreen, CURRTRIAL.sequencelabel, CURRTRIAL.sequenceindex)
        }//ELSE !RSVP, no fixation hold
        logEVENTS("SampleFixationTouchEvent",CURRTRIAL.samplefixationtouchevent,"trialseries")
        logEVENTS("SampleFixationXYT",CURRTRIAL.samplefixationxyt,"trialseries")

        //Store timing of clip presentations
        CURRTRIAL.tsequencedesiredclip = []
        CURRTRIAL.tsequenceactualclip = []
        for (var f=0; f<=CURRTRIAL.sequencetaskscreen.length-1; f++){
            if (f==0 || CURRTRIAL.sequencetaskscreen[f] != CURRTRIAL.sequencetaskscreen[f-1] || CURRTRIAL.sequenceclip[f] != CURRTRIAL.sequenceclip[f-1])
            {               	
               	CURRTRIAL.tsequencedesiredclip.push(CURRTRIAL.tsequence[f])
                if (f > CURRTRIAL.tsequenceactual.length-1){
                    CURRTRIAL.tsequenceactualclip.push(-1)
                }//IF clip not shown
                else{
                    CURRTRIAL.tsequenceactualclip.push(CURRTRIAL.tsequenceactual[f])
                }//ELSE clip shown
            }//IF new clip || new taskscreen within that clip
        }//FOR f frames
    	logEVENTS("TSequenceDesiredClip",CURRTRIAL.tsequencedesiredclip,"trialseries")
    	logEVENTS("TSequenceActualClip",CURRTRIAL.tsequenceactualclip,"trialseries")
        logEVENTS("SampleStartTime",CURRTRIAL.samplestarttime,"trialseries")
        logEVENTS("FrameNum",CURRTRIAL.sequenceframe,'timeseries')
        logEVENTS("TSequenceDesired",CURRTRIAL.tsequence,"timeseries")
        logEVENTS("TSequenceActual",CURRTRIAL.tsequenceactual,"timeseries")

        //Store timestamp from beginnning of display
        EVENTS["timeseries"]["FrameNum"][Object.keys(EVENTS["timeseries"]["FrameNum"]).length-1][1] = CURRTRIAL.samplestarttime_string
        EVENTS["timeseries"]["TSequenceDesired"][Object.keys(EVENTS["timeseries"]["TSequenceDesired"]).length-1][1] = CURRTRIAL.samplestarttime_string
        EVENTS["timeseries"]["TSequenceActual"][Object.keys(EVENTS["timeseries"]["TSequenceActual"]).length-1][1] = CURRTRIAL.samplestarttime_string
        if (FLAGS.savedata == 0){
            updateImageLoadingAndDisplayText(' ') //displays frame tactual - tdesired
        }

		audiocontext.suspend()

//RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    //
//RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    //
//RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    RESPONSE    //
        //========= AWAIT TOUCH RESPONSE =========//
		FLAGS.waitingforTouches = 1
		if (TASK.HideTestDistractors >= 1){
			FLAGS.punishOutsideTouch = 1
		}
		else {
			FLAGS.punishOutsideTouch = 0			
		}

		if (FLAGS.stressTest == 1){
			var race_return = {type: "theld"}
			var nchoices = boundingBoxesChoice3D.x.length;

			if (TASK.Species == 'model') {
				var currchoice = 0;
				var x = 0;
				var y = 0;

				if (CURRTRIAL.num > TASK.ModelConfig.trainIdx) {
					
					let yPred = mkm.model.predict(mkm.dataObj.xTest.reshape([1, 2048]));
					yPred.print();
					yPred = yPred.reshape([2]).argMax(0);
					yPred = yPred.dataSync();
					currchoice = yPred[0];
					console.log('yPred:', currchoice, 'yTrue:', CURRTRIAL.correctitem);
					if (TASK.ModelConfig.saveImages == 1) {
						if (currchoice != CURRTRIAL.correctitem) {
							let mkmodelsRef = storageRef.child('mkturkfiles/mkmodels/');
							let cvsData = mkm.cvs.toDataURL();
							let path = (
								`${TASK.Agent}/${ENV.CurrentDate.toJSON()}/${CURRTRIAL.num}_incorrect.png`
							);
							mkmodelsRef.child(path).putString(cvsData, 'data_url');
						}
					} else if (TASK.ModelConfig.saveImages == 2) {
						let mkmodelsRef = storageRef.child('mkturkfiles/mkmodels/');
						let cvsData = mkm.cvs.toDataURL();
						if (currchoice != CURRTRIAL.correctitem) {
							let path = (
								`${TASK.Agent}/${ENV.CurrentDate.toJSON()}/${CURRTRIAL.num}_incorrect.png`
							);
						} else if (currchoice == CURRTRIAL.correctitem) {
							let path = (
								`${TASK.Agent}/${ENV.CurrentDate.toJSON()}/${CURRTRIAL.num}_correct.png`
							);
						}
						mkmodelsRef.child(path).putString(cvsData, 'data_url');
					}
					
				}
			} else {
				
				var hitrate = 0;

				if (TASK.Agent == 'Youno') {
					hitrate = 0.9;
				} else if (TASK.Agent == 'Eliaso') {
					hitrate = 0.7;
				} else if (TASK.Agent == 'SaveImages') {
					hitrate = 1.0;
				}

				if (Math.random() < hitrate) {
					var currchoice = CURRTRIAL.correctitem;
				} else {
					var distractor_array = [];
					for (let i = 0; i < nchoices; i++) {
						if (i != CURRTRIAL.correctitem) {
							distractor_array.push(i);
						}
					}
					distractor_array = shuffle(distractor_array);
					var currchoice = distractor_array[0];
				}

				var x = boundingBoxesChoice3D.x[currchoice][0] + Math.round(Math.random()*(boundingBoxesChoice3D.x[currchoice][1] - boundingBoxesChoice3D.x[currchoice][0]))
				var y = boundingBoxesChoice3D.y[currchoice][0] + Math.round(Math.random()*(boundingBoxesChoice3D.y[currchoice][1] - boundingBoxesChoice3D.y[currchoice][0]))
			}
			
			
			race_return.cxyt = [currchoice,x,y,Date.now() - ENV.CurrentDate.valueOf()]
			FLAGS.waitingforTouches--
		}//IF StressTest
		else {
            if (TASK.NRSVP > 0){
            	CURRTRIAL.correctitem = 1
                if (TASK.FixationWindowSizeInches <= 0){
                    var race_return = {type: "theld"}
                    var currchoice = 1
                }//IF no fixation required
                else {
                    var race_return = {type: CURRTRIAL.samplefixationtouchevent}

                    if (CURRTRIAL.samplefixationtouchevent == "theld"){
                        var currchoice = 1
                    }//IF held samplefixation
                    else {
                        var currchoice = 0
                    }//ELSE broke samplefixation
                }//ELSE fixation required

                race_return.cxyt = [currchoice,-1,-1,CURRTRIAL.samplefixationxyt[2]]
                FLAGS.waitingforTouches--            
            }//IF RSVP, skip choice
            else{
                var p1 = hold_promise(0,boundingBoxesChoice3D,FLAGS.punishOutsideTouch)
                var p2 = choiceTimeOut(TASK.ChoiceTimeOut)

                var race_return = await Promise.race([p1,p2])
            }//ELSE require choice
		}//ELSE

		CURRTRIAL.responsetouchevent = race_return.type
		CURRTRIAL.response = race_return.cxyt[0]
		CURRTRIAL.responsexyt = [race_return.cxyt[1], race_return.cxyt[2], race_return.cxyt[3]]

		logEVENTS("ResponseXYT",CURRTRIAL.responsexyt,"trialseries")
		logEVENTS("ResponseTouchEvent",CURRTRIAL.responsetouchevent,"trialseries")
		logEVENTS("Response",CURRTRIAL.response,"trialseries")

		// Keep track of repeated responses to one side
		if (TASK.NRSVP <= 0 && CURRTRIAL.num > 0 && FLAGS.savedata && CURRTRIAL.responsetouchevent == "theld"){
			if (CURRTRIAL.response==trialhistory.response[trialhistory.correct.length-1]){
				FLAGS.stickyresponse++;
			}
			else {
				FLAGS.stickyresponse=0;
			}
		} //IF
	} //if TASK.RewardStage
    logEVENTS("CorrectItem",CURRTRIAL.correctitem,"trialseries")



//REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    //
//REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    //
//REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    REWARD PUNISH    //
  // Determine if Choice was correct
  if (CURRTRIAL.response == CURRTRIAL.correctitem){ CURRTRIAL.correct = 1; }
  else { CURRTRIAL.correct=0; }

	//============ DETERMINE NUMBER OF REWARDS ============//
	if (TASK.RewardStage == 0 && samplereward == 0){
		CURRTRIAL.nreward = -1 //skip reward/punish
	}
	else if ( CURRTRIAL.correct && ( samplereward == -1 || TASK.RewardStage == 0 ) ){ //default behavior
		if (FLAGS.savedata && (CURRTRIAL.starttime - trialhistory.starttime[trialhistory.starttime.length-1] < TASK.ConsecutiveHitsITI || CURRTRIAL.num==0)){
			// if correct within bonus interval
			FLAGS.consecutivehits++
		}
		else {
			// took too long, set to 1
			FLAGS.consecutivehits=1
		}
		CURRTRIAL.nreward = 1 + Math.floor(FLAGS.consecutivehits / TASK.NConsecutiveHitsforBonus)

		if (CURRTRIAL.nreward > TASK.NRewardMax){
			CURRTRIAL.nreward = TASK.NRewardMax
		}
	}
	else if (CURRTRIAL.correct && samplereward >= 1){
		//Override if user had manually set reward for that sample image in image_reward_list file
		CURRTRIAL.nreward = samplereward
	}
	else if (!CURRTRIAL.correct){
			FLAGS.consecutivehits=0;
			CURRTRIAL.nreward = 0;
	} //# of rewards to give

	ENV.RewardDuration = setReward();
	logEVENTS("NReward",CURRTRIAL.nreward,"trialseries")
	
	//============ DELIVER REWARD/PUNISH ============//
	//NO FEEDBACK
	if (  CURRTRIAL.nreward == -1 ){
		CANVAS.sequencepost[1] = "blank";
		CANVAS.tsequencepost[2] = 2*CANVAS.tsequencepost[1];
		frame.shown=[]; frame.frames=[];  frame.current=0;
		for (var q in CANVAS.sequencepost){frame.shown[q]=0; frame.frames[q]=[q]};

		renderShape2D(CANVAS.sequencepost[0],-1,OFFSCREENCANVAS)

		var len = CANVAS.tsequencepost.length
		await displayTrial(CANVAS.tsequencepost,
							Array(len).fill(-1),
							range(0,len-1,1),
							CANVAS.sequencepost,
							Array(len).fill(0),
							Array(len).fill(0)) // dispTrial(time,grid,frame,screen,obj,idx)
	}//IF no feedback
	// REWARD
	else if (CURRTRIAL.correct){
		CANVAS.sequencepost[1]="reward";
		CANVAS.tsequencepost[2] = CANVAS.tsequencepost[1]+ENV.RewardDuration*1000;

		for (var q = 0; q <= CURRTRIAL.nreward-1; q++){
			frame.shown=[]; frame.frames=[]; frame.current=0;
			for (var q2 in CANVAS.sequencepost){frame.shown[q2]=0; frame.frames[q2] = [q2]};

			playSound(2);
			renderShape2D(CANVAS.sequencepost[0],-1,OFFSCREENCANVAS)
			var len = CANVAS.tsequencepost.length
			var p1 = displayTrial(CANVAS.tsequencepost,
								Array(len).fill(-1),
								range(0,len-1,1),
								CANVAS.sequencepost,
								Array(len).fill(0),
								Array(len).fill(0)) // dispTrial(time,grid,frame,screen,obj,idx)
			if (ble.connected == false && port.connected == false){
				await Promise.all([p1])
			}
			else if (ble.connected == true){
				var p2 = writepumpdurationtoBLE(Math.round(ENV.RewardDuration*1000))
				await Promise.all([p1, p2])
			}
			else if (port.connected == true){
				var p2 = port.writepumpdurationtoUSB(Math.round(ENV.RewardDuration*1000))
				await Promise.all([p1, p2])
			}
		} //FOR nrewards
	}//ELSEIF correct, then reward
	//PUNISH
	else if (!CURRTRIAL.correct) {
		CANVAS.sequencepost[1] = "punish";
		CANVAS.tsequencepost[2] = CANVAS.tsequencepost[1]+TASK.PunishTimeOut;
		frame.shown=[]; frame.frames=[];  frame.current=0;
		for (var q in CANVAS.sequencepost){frame.shown[q]=0; frame.frames[q]=[q]};

		renderShape2D(CANVAS.sequencepost[0],-1,OFFSCREENCANVAS)
 		var len = CANVAS.sequencepost.length
		var p1 = displayTrial(CANVAS.tsequencepost,
							Array(len).fill(-1),
							range(0,len-1,1),
							CANVAS.sequencepost,
							Array(len).fill(0),
							Array(len).fill(0)) // dispTrial(time,grid,frame,screen,obj,idx)
		var num_trials_to_buffer_in_punishperiod = 50
        var p2 = TQS.generate_trials(num_trials_to_buffer_in_punishperiod*TASK.RSVP)
		playSound(3);
		await Promise.all([p1,p2])
	}//ELSEIF wrong, then timeout
	//============ (end) DELIVER REWARD/PUNISH ============//


//HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    //
//HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    //
//HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    HOUSEKEEPING    //
	//================= HOUSEKEEPING =================//
	var ITIstart = performance.now()

	// CALIBRATE eye
	if (FLAGS.trackeye > 0){
		// Can manually adjust params only when on practice screen
		// Can automatically calibrate when on test screen
		if (FLAGS.savedata == 1 && ENV.Eye.calibration == 1){
				if (CURRTRIAL.fixationtouchevent == 'theld'){
					ENV.Eye.NCalibPointsTrain += 1
				}
				if (ENV.Eye.NCalibPointsTrain == TASK.CalibrateEye){
					// Run calibration fitting 
					var calibreturn = runCallibration()
					ENV.Eye.CalibXTransform = calibreturn.xtform
					ENV.Eye.CalibYTransform = calibreturn.ytform
					ENV.Eye.NCalibPoints = calibreturn.n
					ENV.Eye.CalibType = calibreturn.type

					// Compute GOF
					ENV.Eye.CalibTrainMSE[0] = compute_mse(calibreturn.predictedx,calibreturn.actualx)
					ENV.Eye.CalibTrainMSE[1] = compute_mse(calibreturn.predictedy,calibreturn.actualy)

					// Store calibration
					saveEyeCalibrationtoFirestore(ENV.Eye.CalibXTransform,ENV.Eye.CalibYTransform,ENV.Eye.CalibType,ENV.Eye.NCalibPointsTrain,ENV.Eye.CalibTrainMSE,ENV.Eye.NCalibPointsTest,ENV.Eye.CalibTestMSE)

					ENV.Eye.calibration = 0;
				}//IF enough points
		}//IF train eye calibration
		else if (FLAGS.savedata == 1 && ENV.Eye.calibration == 0){
			if (CURRTRIAL.fixationtouchevent == 'theld'){
				ENV.Eye.NCalibPointsTest += 1
			}//IF held fixation
			if (ENV.Eye.NCalibPointsTest == TASK.CalibrateEye){
				//cross-validate on same number of trials used for training
				ENV.Eye.CalibTestMSE = evaluateCalibration() //GOF test 

				// Store calibration
				saveEyeCalibrationtoFirestore(ENV.Eye.CalibXTransform,ENV.Eye.CalibYTransform,ENV.Eye.CalibType,ENV.Eye.NCalibPointsTrain,ENV.Eye.CalibTrainMSE,ENV.Eye.NCalibPointsTest,ENV.Eye.CalibTestMSE)
			}//IF enough points
		}//ELSE test eye calibration
	}//IF track eye
	
	//clear tracker canvas at end of trial
	if (FLAGS.savedata == 0  || CURRTRIAL.num <= 1){
		EYETRACKERCANVAS.getContext('2d').clearRect(0,0,EYETRACKERCANVAS.width,EYETRACKERCANVAS.height)
	}//IF practice screen

	CURRTRIAL.lastTrialCompleted = new Date()

	// Update EVENTS only if saving data
	if (FLAGS.savedata == 1){
		// Update trial tracking variables
		updateTrialHistory() //appends to running trial history

		// Run automator
		if (TASK.Automator !=0){	
			await automateTask(automator_data, trialhistory);
		}

		if (TASK.Agent != "SaveImages"){
			// Cloud Storage: Save data asynchronously to json
			saveBehaviorDatatoFirebase(TASK, ENV, CANVAS, EVENTS);

			// Firestore Database: Save data asynchronously to database
			if (FLAGS.createnewfirestore == 1){
				saveBehaviorDatatoFirestore(TASK,ENV,CANVAS); //write once
				pingFirestore() //every 10 seconds, will check for data updates to upload to firestore
			}//IF new firestore, kick off firestore database writes

      // BigQuery Table
      // Save display times asynchronously to BigQuery
      if (CURRTRIAL.num == 0){
          pingBigQueryDisplayTimesTable() //uploads eyedata to bigquery every 10 seconds        
      }//IF first trial, kick-off bigquery writes

      // Save eye data asynchronously to BigQuery
      if (FLAGS.trackeye > 0 && CURRTRIAL.num == 0){
          pingBigQueryEyeTable() //uploads eyedata to bigquery every 10 seconds        
      }//IF first trial, kick-off bigquery writes
		}//IF not saving images, save data
	}//IF savedata

	if (FLAGS.need2saveParameters == 1){
		FLAGS.need2saveParameters = saveParameterstoFirebase(); // Save parameters asynchronously
	}

	await checkParameterFileStatusFirebase()
	if ( (new Date).getDate() != ENV.CurrentDate.getDate() || CURRTRIAL.num == 1000){ //in local time
		updateEventDataonFirestore(EVENTS);
		FLAGS.need2loadParameters = 1
	} //if new day, start new file or reached 1000 trials 

	rtdbAgentRef.once('value').then(snap => {
		try {
			FLAGS.rtdbAgentNumConnections = Object.keys(snap.val()).length;
		} catch (err) {
			FLAGS.rtdbAgentNumConnections = 0;
			console.error(`rtdbAgentRef most likely not yet instantiated: ${err}`);
		}
	});

	if (TASK.Agent == "SaveImages" && CURRTRIAL.num >= TQS.samplebag_indices.length-1){
		return
	}//IF saved all images

	//================= (end) HOUSEKEEPING =================//

	updateHeadsUpDisplay();
	console.log('END OF TRIAL ', CURRTRIAL.num)
	CURRTRIAL.num++
	EVENTS.trialnum = CURRTRIAL.num

	if (typeof(TASK.InterTrialInterval) != "undefined"){
		var remainingInterTrialInterval = TASK.InterTrialInterval - (performance.now() - ITIstart)
		if (remainingInterTrialInterval > 0){
			await sleep(remainingInterTrialInterval)
		}
	}//IF ITI
}
})();