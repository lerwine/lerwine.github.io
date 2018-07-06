var gulp = require('gulp');
var WebServer = require('gulp-webserver');
var Mocha = require('gulp-mocha');
var TS = require("gulp-typescript");
var FS = require("fs");
var Path = require("path");
//var gulpFail = require('gulp-fail');
var gulpIf = require('gulp-if');
var tmp = require('tmp');
var Concat = require('gulp-concat');
var Git = require('gulp-git');
/*
Git.status({ args: '-s' }, function(err, stdout) {
    if (err)
        console.error(JSON.stringify(err));
    if (stdout)
        console.log(JSON.stringify(stdout));
});
Git.revParse({ args: '--verify HEAD' }, function(err, hash) {
    if (err) {
        console.error(JSON.stringify(err));
        if (hash)
            console.log(JSON.stringify(hash));
    }
    else if (hash)
        console.log(JSON.stringify(hash));
    else
        console.warn('No output');
});
*/

[{ text: "  origin/gh-pages\n* origin/master", name: "lf" }, { text: "  origin/gh-pages\r\n* origin/master", name: "crlf" }].forEach(function(testData) {
    var lineArray = testData.text.split(/\r\n?|\n/);
    if (lineArray.length == 2) {
        lineArray.map(function(line, index) {
            var matches = line.match(/^\s*(?:(\*)\s+)?(\S+(?:\s+\S+)*)\/(\S+(?:\s+\S+)*)\s*$/);
            if (matches.length == 4) {
                if (index == 0) {
                    if (typeof(matches[1]) == "string")
                        console.warn(testData.name + "[" + index + "] failed - typeof(matches[1]) not expected: \"string\"; actual: " + JSON.stringify(matches[1]));
                    else if (typeof(matches[2]) == "string") {
                        if (matches[2] !== "origin")
                            console.warn(testData.name + "[" + index + "] failed - matches[1] expected: \"origin\"; actual: " + JSON.stringify(matches[2]));
                        else if (typeof(matches[3]) == "string") {
                            if (matches[3] !== "gh-pages")
                                console.warn(testData.name + "[" + index + "] failed - matches[1] expected: \"gh-pages\"; actual: " + JSON.stringify(matches[3]));
                            else
                                console.log(testData.name + "[" + index + "] passed");
                        } else
                            console.warn(testData.name + "[" + index + "] failed - typeof(matches[3]) expected: \"string\"; actual: " + JSON.stringify(typeof(matches[3])));
                    } else
                        console.warn(testData.name + "[" + index + "] failed - typeof(matches[2]) expected: \"string\"; actual: " + JSON.stringify(typeof(matches[2])));
                } else {
                    if (typeof(matches[1]) != "string")
                        console.warn(testData.name + "[" + index + "] failed - typeof(matches[1]) not expected: \"string\"; actual: " + JSON.stringify(matches[1]));
                    else if (typeof(matches[2]) == "string") {
                        if (matches[2] !== "origin")
                            console.warn(testData.name + "[" + index + "] failed - matches[1] expected: \"origin\"; actual: " + JSON.stringify(matches[2]));
                        else if (typeof(matches[3]) == "string") {
                            if (matches[3] !== "master")
                                console.warn(testData.name + "[" + index + "] failed - matches[1] expected: \"master\"; actual: " + JSON.stringify(matches[3]));
                            else
                                console.log(testData.name + "[" + index + "] passed");
                        } else
                            console.warn(testData.name + "[" + index + "] failed - typeof(matches[3]) expected: \"string\"; actual: " + JSON.stringify(typeof(matches[3])));
                    } else
                        console.warn(testData.name + "[" + index + "] failed - typeof(matches[2]) expected: \"string\"; actual: " + JSON.stringify(typeof(matches[2])));
                }
            } else
                console.warn(testData.name + "[" + index + "] failed - matches.length expected: 4; actual: " + matches.length);
        });
    } else
        console.warn(testData.name + " failed - lineArray.length expected: 2; actual: " + lineArray.length);
});