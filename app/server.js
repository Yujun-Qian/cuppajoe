/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


/*jslint node:true*/


/**
 * Returns a new Mojito server instance.
 */
var app = require('mojito').createServer();

module.exports = app.listen();
