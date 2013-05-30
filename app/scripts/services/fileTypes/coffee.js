/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros*/

prepros.factory('coffee', function(config, utils){

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        _id = utils.id;


    var format = function (filePath, projectPath) {

        //File name
        var name = path.basename(filePath);

        //Relative input path
        var shortInput = path.relative(projectPath, filePath).replace(/\\/g, '/');

        // Output path
        var output = filePath.replace(/\.coffee/gi, '.js');

        //Find short output path
        var shortOutput = output.replace(/\\/g, '/');

        //Find output path; save to /js folder if file is in /coffee folder
        if(filePath.match(/\\coffee\\|\/coffee\//gi)) {

            output = path.normalize(output.replace(/\\coffee\\|\/coffee\//gi, path.sep + config.getUserOptions().jsPath + path.sep));

        }

        //Show Relative path if output file is within project folder
        if (path.relative(projectPath, filePath).indexOf('.' + path.sep) === -1) {

            shortOutput = path.relative(projectPath, output).replace(/\\/g, '/');
        }

        return {

            id: _id(filePath),
            pid: _id(projectPath),
            name: name,
            type: 'Coffee',
            input: filePath,
            shortInput: shortInput,
            output: output,
            shortOutput: shortOutput,
            config: config.getUserOptions().coffee
        };
    };

    var compile = function (file, callback) {

        var coffee = require('coffee-script');

        var ugly = require('uglify-js');

        var options = {};

        if(file.config.bare){

            options.bare = true;
        }

        fs.readFile(file.input, { encoding: 'utf8' }, function (err, data) {
            if (err) {

                callback(true, err.message);

            } else {

                try {

                    var javascript = coffee.compile(data.toString(), options);

                    if (file.config.uglify) {

                        javascript = ugly.minify(javascript, {fromString: true}).code;
                    }

                    fs.outputFile(file.output, javascript, function (err) {

                        if (err) {

                            callback(true, err.message);

                        } else {

                            callback(false, file.input);

                        }

                    });


                } catch (e) {

                    callback(true, e.message + "\n" + file.input);
                }
            }
        });
    };

    return {
        format: format,
        compile: compile
    };
});