cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.splashscreen/www/splashscreen.js",
        "id": "org.apache.cordova.splashscreen.SplashScreen",
        "clobbers": [
            "navigator.splashscreen"
        ]
    },
    {
        "file": "plugins/de.neofonie.cordova.plugin.nativeaudio/www/nativeaudio.js",
        "id": "de.neofonie.cordova.plugin.nativeaudio.nativeaudio",
        "clobbers": [
            "window.plugins.NativeAudio"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.splashscreen": "0.3.2",
    "de.neofonie.cordova.plugin.nativeaudio": "2.8.1"
}
// BOTTOM OF METADATA
});