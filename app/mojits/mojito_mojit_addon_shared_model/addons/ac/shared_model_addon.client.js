/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */

/*global YUI: true*/

'use strict';

YUI.add('mojito_mojit_addon_shared_model', function (Y, NAME) {

    function Addon(command, adapter, ac) {

        YUI.mojito = YUI.mojito || {};
        YUI.mojito.cache = YUI.mojito.cache || {};
        YUI.mojito.cache.models = YUI.mojito.cache.models || {};

        this.ac = ac;
        this.models = YUI.mojito.cache.models;
    }

    Addon.prototype = {

        namespace: 'shared_model_addon',

        load: function (name) {
            if (!this.models[name]) {
                if (this.ac.models.get(name)) {
                    this.models[name] = this.ac.models.get(name);
                } else {
                    Y.log('Model "' + name + '" not found.', 'debug', NAME);
                }
            } else {
                Y.log('Model "' + name + '" served from cache.', 'debug', NAME);
            }
            return this.models[name];
        }

    };

    Y.mojito.addons.ac.shared_model_addon = Addon;

}, '0.1.0', {requires: [
    'mojito',
    'mojito-models-addon'
]});
