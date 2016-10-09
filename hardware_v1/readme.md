The basic mkturk hardware setup requires an electronics board that receives a trigger from the tablet and dispenses a reward. In mkturk_v1, this was accomplished using either an audio (trigger from sound jack) or a photo (tigger photodiode by white bar on screen) trigger to an arduino micro which then gated open a 5V signal to drive a low power pump. Triggering with a photodiode is recommend as we found more consistent behavior than using the audio line as a trigger. Although we used a pump, an alternative is to open and close a valve that gates a gravity fed water source as is found in some commercial systems. Finally, the whole system can be powered by a USB battery pack since both the tablet and the arduino take microusb input.

See the schematic and associated parts list in this folder for constructing a similar circuit.