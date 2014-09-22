/**
 * @module Notification sounds
 */

angular.module('subtrack90.game.notificationSounds', [])

/**
 * @module Notification sounds
 * @class Service
 * @description Notification sounds service
 */
.service('notificationSounds', ['$http', '$q', function ($http, $q) {

    function Player(name) {
        this.track = name;
    }

    Player.prototype.trackName = function () {
        return this.track;
    };

    Player.prototype.setBuffer = function (buffer) {
        this.trackBuffer = buffer;
    };

    Player.prototype.play = function () {
        var source = context.createBufferSource();
        source.buffer = this.trackBuffer;
        source.connect(context.destination);
        source.start(0);
    };

    Player.prototype.stop = function () {
        this.trackBuffer.stop(0);
    };

    var deferredService = $q.defer();
    var context;
    var apiMethods = {};

    var tracks = [
        {
            name: 'Robot_blip-Marianne_Gagnon.mp3',
            apiMethod: 'messageDisplayed'
        }, {
            name: 'Sad_Trombone-Joe_Lamb.mp3',
            apiMethod: 'objectiveFailed'
        }, {
            name: 'Ta_Da-SoundBible.mp3',
            apiMethod: 'objectiveAchieved'
        }];

    _.each(tracks, function (track) {
        var player = new Player(track.name);
        apiMethods[track.apiMethod] = player;
    });

    function init() {
        try {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
        } catch (e) {
            alert('Web Audio API is not supported in this browser');
        }

        getTracks().then(function () {
            deferredService.resolve(apiMethods);
        });
    }

    function getTracks() {
        var promises = [];

        _.each(apiMethods, function (player) {
            var track = loadTrack(player);
            var buffer = track.then(createBuffer);
            var promise = buffer.then(function (result) {
                player.setBuffer(result);
            });
            promises.push(promise);
        });

        return $q.all(promises);
    }

    function loadTrack(player) {
        return $http({
            method: "GET",
            url: 'audio/' + player.trackName(),
            responseType: 'arraybuffer'
        });
    }

    function createBuffer(httpResponse) {
        var soundSourceDeferred = $q.defer();
        context.decodeAudioData(httpResponse.data, function (buffer) {
            soundSourceDeferred.resolve(buffer);
        });
        return soundSourceDeferred.promise;
    }

    init();

    return deferredService.promise;
}]);