export interface ENV {
  ResearcherDisplayName: string,
  ResearcherEmail: string,
  ResearcherID: string,
  USBDeviceType: string,
  USBDeviceName: string,
  Subject: string,
  AgentRFID: string,
  CurrentDate: Date,
  ImageHeightPixels: number,
  ImageWidthPixels: number,
  CanvasRatio: number,
  DevicePixelRatio: number,
  FixationRadius: number,
  FixationColor: string,
  ChoiceRadius: number,
  ChoiceColor: string,
  XGridCenter: number[],
  YGridCenter: number[],
  RewardDuration: number,
  ParamFileName: string,
  ParamFileRev: string,
  ParamFileDate: string,
  DataFileName: string,
  FirestoreDocRoot: string,
  CurrentAutomatorStageName: string,
  MinPercentCriterion: number,
  MinTrialsCriterion: number,

  WebBluetoothAvailable: number,
  WebUSBAvailable: number,
  BatteryAPIAvailable: number,
  OffscreenCanvasAvailable: number,

  UserAgent: string,
  DeviceType: string,
  DeviceBrand: string,
  DeviceName: string,
  DeviceScreenWidth: any, // maybe number or string not sure yet
  DeviceScreenHeight: any, // maybe number or string not sure yet
  DeviceGPU: string,
  DeviceBrowserName: string,
  DeviceBrowserVersion: string,
  DeviceOSName: string,
  DeviceOSCodename: string,
  DeviceOSVersion: string,
  DeviceTouchscreen: string,

  ScreenRatio: number,
  ScreenSizePixels: number[],
  ScreenSizeInches: number[],
  ViewportPixels: number[],

  ViewportPPI: number,
  PhysicalPPI: number,

  Task: string,
  FixationScale: number,
  SampleScale: number,
  TestScale: number,
  ChoiceScale: number,

  Eye: Eye,
  init(): any;
}

export interface Eye {
  // RAW USB stream
  Time: any[],
  N: number,

  // Eye states
  EventType: string,
  timeOfLastGlanceInBB: number,
  BlinkGracePeriod: number,

  // Calibration
  Calibration: number,
  CalibXTransform: any[], // don't know exact type yet
  CalibYTransform: any[], // don't know exact type yet
  CalibType: string,
  NCalibPointsTrain: number,
  NCalibPointsTest: number,
  CalibTrainMSE: any[], // don't know exact type yet
  CalibTestMSE: any[] // don't know exact type yet
}

export interface FLAGS {
  consecutivehits: number,
  need2loadImagesTrialQueue: number,
  need2loadScenes: number,
  scene3d: number,
  need2loadParameters: number,
  savedata: number,
  stage: number,
  imagesPresent: number,
  stickyresponse: number,

  waitingforTouches: number,
  touchduration: number,
  punishOutsideTouch: number,
  acquiredTouch: number,
  touchGeneratorCreated: number,
  runPump: number,
  firestorecreatedoc: number,
  firestorelastsavedtrial: number,
  firestoretimeron: number,
  stressTest: number,
  RFIDGeneratorCreated: number,
  init(): any
}

export interface CANVAS {
  names: string[],
  front: string,
  sequenceblank: string[],
  tsequenceblank: number[],
  sequencepre: string[],
  tsequencepre: number[],
  sequence: string[],
  tsequence: number[], // initiated as NaN in mkturk_globalvariables.js
  sequencepost: string[],
  tsequencepost: number[],
  headsupfraction: number,
  offsetleft: number,
  offsettop: number,
  init(): void
}

export interface frame {
  current: number,
  shown: number[]
}

export interface CURRTRIAL {
  num: number,
  starttime: number,
  fixationgridindex: number,
  fixationxyt: number[],
  allfixationxyt: number[],
  sampleindex: number,
  sampleimage: any[], // don't know exact type yet; maybe string[]
  testindices: any, // don't know exact type yet; maybe number[], or just number
  testimages: any[], // don't know exact type yet; maybe string[]
  responsexyt: any[], // don't know exact type yet
  response: any[], // don't know exact type yet
  correctitem: number,
  correct: any[], // don't know exact type yet
  nreward: number,
  fixationtouchevent: string,
  responsetouchevent: string,
  lastTrialCompleted: Date,
  lastFirebaseSave: Date,
  tsequenceactual: number[], // don't know exact type yet
  tsequencedesired: number[], // don't know exact type yet
  xyt: any[], // don't know exact type yet

  sampleobjectty: number[],
  sampleobjecttz: number[],
  sampleobjectrxy: number[],
  sampleobjectrxz: number[],
  sampleobjectryz: number[],
  sampleobjectscale: number[],

  testobjectty: any[],
  testobjecttz: any[],
  testobjectrxy: any[],
  testobjectrxz: any[],
  testobjectryz: any[],
  testobjectscale: any[],

  // need to check types for all these; are they number or string ?
  sample_scenebag_label: any,
  sample_scenebag_index: any,
  test_scenebag_labels: any,
  test_scenebag_indices: any,
  init(): any,
}

// TODO: export interface EVENTS

// check types 
export interface trialhistory {
  trainingstage: any[],
  starttime: any[],
  response: any[],
  correct: any[]
}

export interface TRIAL {
  StartTime: any[],
  FixationGridIndex: any[],
  FixationXYT: any[],
  AllFixationXYT: any[],
  Sample: any[],
  Test: any[],
  ResponseXYT: any[],
  Response: any[],
  CorrectItem: any[],
  FixationTouchEvent: any[],
  ResponseTouchEvent: any[],
  NReward: any[],
  AutomatorStage: any[],
  TSequenceDesired: any[],
  TSequenceActual: any[],
  RFIDTag: any[],
  RFIDTime: any[],
  RFIDTrial: any[],
  NRFID: number,
  Weight: number[],
  WeightTime: any[],
  WeightTrial: any[],
  NWeights: number,
  BatteryLDT: any[],

  // if (typeof(FlAGS) != 'undefined' && FLAGS.scene3d == 0)
  SampleObjectTy: any[],
  SampleObjectTz: any[],
  SampleObjectRxy: any[],
  SampleObjectRxz: any[],
  SampleObjectRyz: any[],
  SampleObjectScale: any[],

  TestObjectTy: any[],
  TestObjectTz: any[],
  TestObjectRxy: any[],
  TestObjectRxz: any[],
  TestObjectRyz: any[],
  TestObjectScale: any[]

  reset(ENV: ENV, FLAGS: FLAGS): any;
  update(CURRTRIAL: CURRTRIAL, FLAGS: FLAGS): any;
}

export interface sounds {
  serial: number[],
  buffer: any[]
}