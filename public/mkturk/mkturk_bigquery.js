function pingBigQueryEyeTable(){
	if (Object.keys(EVENTS['timeseries']['EyeData']).length > 0  && 
		typeof(bigqueryEyeTimer) != "undefined"){
		saveEyeDatatoBigQuery()
	} //if timer expired & new data added
	else {
		bigqueryEyeTimer = setTimeout(function(){
			clearTimeout(bigqueryEyeTimer)
			pingBigQueryEyeTable()
		},10000)
	} //else check again in 10 seconds
}//FUNCTION pingBigQueryEyeTable


function pingBigQueryDisplayTimesTable(){
	if (Object.keys(EVENTS['timeseries']['TSequenceActual']).length > 0  && 
		typeof(bigqueryDisplayTimer) != "undefined"){
		saveDisplayTimestoBigQuery()
	} //if timer expired & new data added
	else {
		bigqueryDisplayTimer = setTimeout(function(){
			clearTimeout(bigqueryDisplayTimer)
			pingBigQueryDisplayTimesTable()
		},10000)
	} //else check again in 10 seconds
}//FUNCTION pingBigQueryEyeTable()

function saveEyeDatatoBigQuery(){
eventtype = 'timeseries'
eventname = 'EyeData'
var nsamples = Object.keys(EVENTS[eventtype][eventname]).length 

	var eyedata = []
	for (var i=0; i<=nsamples-1; i++){
		eyedata.push(
			{
				'agent': ENV.Subject,
				'timestamp': EVENTS[eventtype][eventname][i][1],
	  			'trial_num': EVENTS[eventtype][eventname][i][0],
				'num_eyes': EVENTS[eventtype][eventname][i][2],
				'left_x': EVENTS[eventtype][eventname][i][3],
				'left_y': EVENTS[eventtype][eventname][i][4],
				'left_aux_0': EVENTS[eventtype][eventname][i][5],
				'left_aux_1': EVENTS[eventtype][eventname][i][6],
				'right_x': EVENTS[eventtype][eventname][i][7],
				'right_y': EVENTS[eventtype][eventname][i][8],
				'right_aux_0': EVENTS[eventtype][eventname][i][9],
				'right_aux_1': EVENTS[eventtype][eventname][i][10]
			}
		)//push single event
	}//FOR i events

	bqInsertEyeData(eyedata)

	//reset eye event accumulation in mkturk (reduce memory load)
	EVENTS[eventtype][eventname] = {}

	delete bigqueryEyeTimer //to start a new timer
	pingBigQueryEyeTable()
}//FUNCTION saveEyeDatatoBigQuery

function saveDisplayTimestoBigQuery(){
eventtype = 'timeseries'
eventname1 = 'FrameNum'
eventname2 = 'TSequenceDesired'
eventname0 = 'TSequenceActual'
var nsamples = Object.keys(EVENTS[eventtype][eventname0]).length 

	var displaydata = []
	for (var i=0; i<=nsamples-1; i++){
		displaydata.push(
			{
				'agent': ENV.Subject,
				'timestamp': EVENTS[eventtype][eventname0][i][1],
	  			'trial_num': EVENTS[eventtype][eventname0][i][0],
				'frame_num': EVENTS[eventtype][eventname1][i].slice(2,EVENTS[eventtype][eventname1][i].length),
				't_desired': EVENTS[eventtype][eventname2][i].slice(2,EVENTS[eventtype][eventname2][i].length),
				't_actual': EVENTS[eventtype][eventname0][i].slice(2,EVENTS[eventtype][eventname0][i].length)
			}
		)//push single event
	}//FOR i events

	bqInsertDisplayTimes(displaydata)

console.log("Sent DisplayTimes to BIGQUERY")

	//reset eye event accumulation in mkturk (reduce memory load)
	EVENTS[eventtype][eventname0] = {}
	EVENTS[eventtype][eventname1] = {}
	EVENTS[eventtype][eventname2] = {}

	delete bigqueryDisplayTimer //to start a new timer
	pingBigQueryDisplayTimesTable()
}//FUNCTION saveDisplayTimestoBigQuery()