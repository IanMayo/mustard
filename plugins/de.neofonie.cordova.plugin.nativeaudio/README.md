#Cordova Native Audio Plugin
=======================

Cordova / PhoneGap 3.5+ extension for Native Audio playback, aimed at HTML5 gaming and audio applications which require minimum latency, polyphony and concurrency.

=======================

## Contents

1. [Description](#description)
2. [History](#history)
3. [Perspective](#perspective)
4. [Roadmap](#roadmap)
5. [AngularJS Integration](#angularjs-integration)
6. [Next Steps](#next-steps)
7. [Platform Support](#support)
8. [Installation](#installation)
9. [Usage](#usage)
10. [Functions](#functions)
11. [Example Drum Pad](#example-drum-pad)

=======================

##Description

This Cordova / PhoneGap (3.5+) plugin enables concurrency (multi-channel playback), polyphony (multi-voice playback) and minimized latency (via caching) in audio-based applications, by leveraging native audio APIs. Designed for the use in HTML5-based cross-platform games and mobile/hybrid audio applications.

=======================
##History

Community-driven, clean fork of the Low Latency Audio Plugin for Cordova / PhoneGap, initially published by [Andrew Trice](http://www.tricedesigns.com/2012/01/25/low-latency-polyphonic-audio-in-phonegap/) and then maintained by [Raymond Xie](http://github.com/floatinghotpot/).

This project cleans up a lot of legacy code, and adds success, error and completion callbacks. It also features integration in AngularJS projects via [ngCordova](http://www.ngcordova.com).

=======================

## Perspective
Following the Cordova philosophy, this is a shim for a web audio implementation (on mobile) which is as fast and feature-rich as native mobile APIs. Currently, neither HTML5 Audio or the more recent Web Audio API offer a cross-platform solution which 1) is fast, 2) supports polyphony, 3) concurrency and 4) maintains a low overhead.

It should be replaced by a standardised W3C solution as soon as such an implementation offers comparable performance across (mobile) devices, which is crucial for HTML5-based games.

=======================

##AngularJS Integration

This plugin is available as an AngularJS service module, facilitating the usage in AngularJS-based Cordova/PhoneGap projects.

It extends the ngCordova project, an effort by the great guys at [Drifty](http://github.com/driftyco), creators of the Ionic Framework.
Download it at the ngCordova [website](http://www.ngcordova.com) or the [repository](http://www.github.com/driftyco/ng-cordova).

=======================

## Next Steps
* update ngCordova with newest API features

=======================

##Support

* iOS, tested (6.1, 7.1.2)
* Android, tested (4+)

=======================

##Installation

Via Cordova CLI:
```bash
cordova plugin add de.neofonie.cordova.plugin.nativeaudio
```
=======================
##Usage

1. Wait for `deviceReady`.
1. Preload an audio asset and assign an id - either optimized for single-shot style short clips (`preloadSimple()`) or looping, ambient background audio (`preloadComplex()`)
2. `play()` the audio asset via its id.
3. `unload()` the audio asset via its id.

=======================
##Functions
```javascript
preloadSimple: function ( id, assetPath, successCallback, errorCallback)
```
Loads an audio file into memory. Optimized for short clips / single shots (up to five seconds).
Cannot be stopped / looped.

Uses lower-level native APIs with small footprint (iOS: AudioToolbox/AudioServices).
Fully concurrent and multichannel.

* params
 * id - string unique ID for the audio file
 * assetPath - the relative path or absolute URL (inluding http://) to the audio asset.
 * successCallback - success callback function
 * errorCallback - error callback function


```javascript
preloadComplex: function ( id, assetPath, volume, voices, successCallback, errorCallback)
```

Loads an audio file into memory. Optimized for background music / ambient sound.
Can be stopped / looped.

Uses higher-level native APIs with a larger footprint. (iOS: AVAudioPlayer).

####Voices
By default, there is 1 voice, that is: one instance that will be stopped & restarted on play().
If there are multiple voices (number greater than 0), it will cycle through voices to play overlapping audio.

####Volume
The default volume is 1.0, a lower default can be set by using a numerical value from 0.1 to 1.0.

* params
 * id - string unique ID for the audio file
 * assetPath - the relative path to the audio asset within the www directory
 * volume - the volume of the preloaded sound (0.1 to 1.0)
 * voices - the number of multichannel voices available
 * successCallback - success callback function
 * errorCallback - error callback function

```javascript
play: function (id, successCallback, errorCallback, completeCallback)
```

Plays an audio asset.

* params:
 * id - string unique ID for the audio file
 * successCallback - success callback function
 * errorCallback - error callback function
 * completeCallback - error callback function

```javascript
loop: function (id, successCallback, errorCallback)
```
Loops an audio asset infinitely - this only works for assets loaded via preloadComplex.

* params
 * ID - string unique ID for the audio file
 * successCallback - success callback function
 * errorCallback - error callback function

```javascript
stop: function (id, successCallback, errorCallback)
```

Stops an audio file. Only works for assets loaded via preloadComplex.

* params:
 * ID - string unique ID for the audio file
 * successCallback - success callback function
 * errorCallback - error callback function

```javascript
unload: function (id, successCallback, errorCallback)
```

Unloads an audio file from memory.


* params:
 * ID - string unique ID for the audio file
 * successCallback - success callback function
 * errorCallback - error callback function

```javascript
setVolumeForComplexAsset: function (id, volume, successCallback, errorCallback)
```

Changes the volume for preloaded complex assets.
 
 
* params:
 * ID - string unique ID for the audio file
 * volume - the volume of the audio asset (0.1 to 1.0)
 * successCallback - success callback function
 * errorCallback - error callback function

=======================
##Example

In this example, the resources reside in a relative path under the Cordova root folder "www/".

```javascript
if( window.plugins && window.plugins.NativeAudio ) {
	
	// Preload audio resources
	window.plugins.NativeAudio.preloadComplex( 'music', 'audio/music.mp3', 1, 1, function(msg){
	}, function(msg){
		console.log( 'error: ' + msg );
	});
	
	window.plugins.NativeAudio.preloadSimple( 'click', 'audio/click.mp3', function(msg){
	}, function(msg){
		console.log( 'error: ' + msg );
	});


	// Play
	window.plugins.NativeAudio.play( 'click' );
	window.plugins.NativeAudio.loop( 'music' );


	// Stop multichannel clip after 60 seconds
	window.setTimeout( function(){

		window.plugins.NativeAudio.stop( 'music' );
			
		window.plugins.NativeAudio.unload( 'music' );
		window.plugins.NativeAudio.unload( 'click' );

	}, 1000 * 60 );
}
```

=======================
## Example Drum Pad
The demo drumpad in the examples directory is a first starting point.

```bash
cordova create drumpad com.example.nativeaudio drumpad
cd drumpad
cordova platform add ios
cordova plugin add de.neofonie.cordova.plugin.nativeaudio
rm -R www/*
cp -r plugins/de.neofonie.cordova.plugin.nativeaudio/examples/drumpad/* www
cordova build ios
cordova emulate ios
```