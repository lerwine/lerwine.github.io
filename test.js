var FS = require("fs");
var Path = require("path");
var util = require('util');
var os = require('os');

var re2 = /[\t\x20-\xfe]*((?:(?:\r\n)+[\t\x20-\xfe]+)+(?:\r\n)*)?/;
var re = /[\t\x20-\xfe]*((?:\r\n)+(?:[\t\x20-\xfe]+(?:(?:\r\n)+[\t\x20-\xfe]+)*(?:\r\n)*)?)?/;

console.log(re.source);