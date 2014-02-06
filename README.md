Mustard
=======

Open Source (MIT License) mobile app to gamify Sonar best practices.

#Installation

```
$ sudo npm install -g phonegap
```


###iOS emulator installation

```
$ sudo npm install ios-sim -g
```

```
$ phonegap run ios
```

###Android sdk and emulator installation

First step is to install android sdk

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
$ phonegap run android
```

You can bump with "ant" problem which is solved for OSX in such a way

```
$ brew update
```

```
$ brew install ant
```


#Components
[https://github.com/phonegap/phonegap-cli](https://github.com/phonegap/phonegap-cli)

[https://github.com/phonegap/ios-sim](https://github.com/phonegap/ios-sim)

[https://github.com/thewildpendulum/gaps](https://github.com/thewildpendulum/gaps)
