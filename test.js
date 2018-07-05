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

Git.exec({ args: 'branch' }, function(err, stdout) {
    if (err)
        console.error(JSON.stringify(err));
    if (stdout) {
        var ra = stdout.match(/(?:^|[\r\n])[^\S\r\n]*\*[^\S\r\n]*(\S+(?:[^\S\r\n]+\S+)*)/);
        console.log(ra[1]);
        return ra[1];
    }
});