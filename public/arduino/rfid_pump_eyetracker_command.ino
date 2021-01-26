// Arduino code for mkturk:
// Integrated with pump code
// Parses tag from software serial stream to transmit as a word over WebUSB

#include <WebUSB.h>
#include <SoftwareSerial.h>

WebUSB WebUSBSerial(1, “webusb.github.io/arduino/demos”);
#define Serial WebUSBSerial

// PUMP
const byte numChars = 32;
char receivedPumpChars[numChars];
char receivedSampleCommandChars[numChars];
boolean newPumpCommand = false;
boolean newSampleCommand = false;
const int pumpPIN=2;
const int pumpLEDPIN=7;
const int sampleCommandPin = A2; //CAMERA TRIGGER PIN, also for future external devices
int pumpdur;
int samplecommand;

// RFID
const byte numCharsTag = 12;
char receivedRFIDChars[numCharsTag+1]; // variable to store the data from the serial port
boolean newRFIDTag = false;
SoftwareSerial mySerial(10, 11);
int RFIDResetPin = 11;

char startMarker = ‘{’;
char endMarker = ‘}’;

char pumpStartMarker = ‘{’;
char pumpEndMarker = ‘}’;
char sampleCommandStartMarker = ‘$’;
char sampleCommandEndMarker = ‘%’;

// EYE TRACKER
SoftwareSerial mySerialEYE(8, 9);
byte val = 0;

void setup() {
  pinMode(pumpPIN, OUTPUT);
  pinMode(pumpLEDPIN, OUTPUT);
  while (!Serial) {
    ;
  }
  Serial.begin(57600);
  Serial.println(“<Arduino is ready> Sketch begins \r\n>“);
  Serial.flush();
  
  pinMode(RFIDResetPin, OUTPUT);
  digitalWrite(RFIDResetPin, LOW);
  digitalWrite(RFIDResetPin, HIGH);
  mySerial.begin(9600);

  mySerialEYE.begin(57600);
}

void loop() {
  // receive pump || rfid data || eye tracker data
  recvEyeTracker();
  recvWithStartEndMarkers();
  readRFIDTag();
  
  // act on pump || rfid
  turnOnPump();
  turnOnOffExternalDevice();
  transmitTag();
  resetReader();
}

//EYE TRACKER
void recvEyeTracker(){
  while(mySerialEYE.available() > 0) {
      val =  mySerialEYE.read();
      Serial.write(val);
      Serial.flush();
  }
}


// PUMP
void recvWithStartEndMarkers() {
    static boolean pumpRecvInProgress = false;
    static boolean sampleCommandRecvInProgress = false;
    static byte ndx = 0;
    char rc;
    while (Serial && Serial.available() > 0 && newPumpCommand == false && newCamCommand == false) { //When newPumpCommand is true you actually do the triggering
        rc = Serial.read();
        
        if (pumpRecvInProgress == true) {
            if (rc != pumpEndMarker) {
                receivedPumpChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedPumpChars[ndx] = ‘\0’; // terminate the string
                pumpRecvInProgress = false;
                ndx = 0;
                newPumpCommand = true;
            }
        }
        else if (sampleCommandRecvInProgress == true){
          Serial.print(“HELLO ... “);
          Serial.flush();
          if (rc != sampleCommandEndMarker){
            receivedSampleCommandChars[ndx] = rc;
            ndx++;
          }
             else {
                receivedSampleCommandChars[ndx] = ‘\0’; // terminate the string
                sampleCommandRecvInProgress = false;
                ndx = 0;
                newSampleCommand = true;
          }
        }
        else if (rc == sampleCommandStartMarker){
          sampleCommandRecvInProgress = true;
        }
        else if (rc == pumpStartMarker) {
            pumpRecvInProgress = true;
        }
    }
}
void turnOnPump() {
  if (newPumpCommand == true) {
    Serial.print(“Received from WebUSB ... “);
    Serial.println(receivedPumpChars);
    Serial.flush();
    
    pumpdur = atoi(receivedPumpChars);
    digitalWrite(pumpPIN,HIGH);
    digitalWrite(pumpLEDPIN,HIGH);
    delay(pumpdur);
    digitalWrite(pumpPIN,LOW);
    digitalWrite(pumpLEDPIN,LOW);
    newPumpCommand = false;
    
    Serial.print(“Pump triggered, dur=“);
    Serial.print(pumpdur);
    Serial.flush();
  }
}

// EXTERNAL DEVICE TRIGGER
void turnOnOffExternalDevice(){
  // Should check to see if you should turn camera on or off depending on trigger
  if (newSampleCommand == true) {
    Serial.print(“Received from WebUSB ... “);
    Serial.println(receivedSampleCommandChars);
    Serial.flush();

    samplecommand = atoi(receivedSampleCommandChars;
    if ( samplecommand == 1){
      digitalWrite(sampleCommandPin,HIGH);
    }
    if ( samplecommand == 0){
      digitalWrite(sampleCommandPin,LOW);
    }
    newSampleCommand = false;
    Serial.print("Received sample command trigger=").
    Serial.print(samplecommand)
    Serial.flush();
  }
}

// RFID
void readRFIDTag() {
  static boolean recvInProgress = false;
  static byte ndx = 0;
  char startMarker = ‘0’;
  char rc;
  
  while(mySerial.available()>0 && newRFIDTag == false) {
    rc = mySerial.read();
    
    if (recvInProgress == true){
      if (ndx < numCharsTag){
        receivedRFIDChars[ndx] = rc;
        ndx++;
      }
      else {
        receivedRFIDChars[ndx] = ‘\0’; // terminate the string
        ndx = 0;
        recvInProgress = false;
        newRFIDTag = true;
      }
    }
    else if (rc == startMarker){
      recvInProgress = true;
      ndx=0;
      receivedRFIDChars[ndx] = rc;
      ndx++;
    }
  }
}

void transmitTag(){
  if (newRFIDTag == true){
    Serial.print(“Received RFID Tag on SoftwareSerial ... “);
    Serial.print(startMarker);
    Serial.print(“tag”);
    Serial.print(receivedRFIDChars);
    Serial.println(endMarker);
    Serial.flush();
  }
}
//Reset the RFID reader to read again.
void resetReader(){
  if (newRFIDTag == true){
    digitalWrite(RFIDResetPin, LOW);
    digitalWrite(RFIDResetPin, HIGH);
    newRFIDTag = false;
  }
}
