module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        "index-missions": {
            src: 'www/js/game/scenarios'
        }
    });

    grunt.registerMultiTask('index-missions', 'Create missions index', function () {
//        var scenarios = [];
//
//        console.log(this.filesSrc);
//
//        grunt.file.recurse('www/js/game/scenarios', function (abspath) {
//            var file = grunt.file.readJSON(abspath);
//            scenarios.push(file);
//        });
    });
};
