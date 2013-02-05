/**
 * Copyright (c) 2013. All rights reserved.
 */
/*global YUI*/

'use strict';

YUI.add('mojito_mojit_shared', function (Y, NAME) {

    Y.mojito.controllers[NAME] = {
        namespace: 'mojito_mojit_shared'
    };

}, '0.0.1', { requires: [
    'mojito',
    'mojito_mojit_addon_shared_model'
]});
