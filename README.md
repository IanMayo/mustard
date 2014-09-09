SubTrack &#39;90
=======

Open Source (MIT License) mobile app to gamify Sonar best practices.

#Installation

```
$ sudo npm install -g cordova
```

```
$ npm install
```

```
$ grunt build
```

### Verify missions against JSON schema

A [JSON Schema](www/js/game/scenarios/schemas/mission.json) constrains the mission level scenarios. Run validator with this:

```
$ grunt validate
```


###iOS emulator installation

```
$ sudo npm install ios-sim -g
```

```
$ cordova emulate ios
```

###Android sdk and emulator installation

First step is to install android sdk

[https://developer.android.com/sdk/installing/index.html](https://developer.android.com/sdk/installing/index.html)

[http://docs.phonegap.com/en/2.2.0/guide_getting-started_android_index.md.html](http://docs.phonegap.com/en/2.2.0/guide_getting-started_android_index.md.html)

<pre>
# Android sdk OSX example
export ANDROID_HOME=/Users/%username%/Development/android-sdk-macosx
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
</pre>

Let's setup android emulator if you add path correctly

```
$ android avd
```

And try to run

```
$ cordova emulate android
```

You can bump with "ant" problem on OSX, do the next to solve it

```
$ brew update
```

```
$ brew install ant
```


#Components
[https://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html](https://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html)

[https://github.com/thewildpendulum/gaps](https://github.com/thewildpendulum/gaps)
