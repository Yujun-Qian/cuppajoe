/*
 * Copyright (c) 2011 Yahoo! Inc. All rights reserved.
 */

/*jslint node: true*/

"use strict";

process.chdir(__dirname);

var Mojito = require('mojito');
var app = Mojito.createServer();

module.exports = function (config, token) {
    process.emit('application-ready', token, app.getHttpServer());
};
