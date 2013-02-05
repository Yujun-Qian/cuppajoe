/**
 * Copyright (c) 2013, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*jslint node:true*/
/*global YUI,YUITest,console*/

YUI.add('mojito_mojit_addon_shared_model-tests', function (Y, NAME) {
    var suite = new YUITest.TestSuite(NAME),
        A = YUITest.Assert,
        OA = YUITest.ObjectAssert,
        command,
        adapter,
        ac,
        addon;

    suite.add(new YUITest.TestCase({
        'name': 'mojito_mojit_addon_shared_model tests',
        'setUp': function () {
            command = {};
            adapter = {
                req: {
                    mojito: {
                        cache: {
                            models: {
                            }
                        }
                    }
                }
            };
            ac = { done: function () { } };
        },

        'tearDown': function () {
            command = null;
            adapter = null;
            ac = null;
        },

        'test Addon with NO defaults': function () {
            delete adapter.req.mojito;

            addon = new Y.mojito.addons.ac.shared_model_addon(command, adapter, ac);
            OA.areEqual(ac, addon.ac, 'ac does not match');
            OA.areEqual({}, addon.models, 'models do ont match');
        },
        'test Addon with defaults': function () {
            adapter.req.mojito.cache.models = { foo: 'bar' };

            addon = new Y.mojito.addons.ac.shared_model_addon(command, adapter, ac);
            OA.areEqual({foo: 'bar' }, addon.models, 'models do not match');
        },
        'test load with cache empty': function () {

            var model;
            ac = {
                models: {
                    get: function (n) {
                        A.areEqual('user', n, 'wrong user');
                        return { foo: 'bar' };
                    }
                }
            };
            addon = new Y.mojito.addons.ac.shared_model_addon(command, adapter, ac);
            model = addon.load('user');
            OA.areEqual({foo: 'bar'}, model, 'wrong model');
        },
        'test load with cache populated': function () {
            var model;
            adapter.req.mojito.cache.models.user = { foo: 'bar' };
            addon = new Y.mojito.addons.ac.shared_model_addon(command, adapter, ac);
            model = addon.load('user');
            OA.areEqual({foo: 'bar'}, model, 'wrong model');
        },
        'test load with invalid key': function () {

            ac = {
                models: {
                    get: function (n) {
                        return undefined;
                    }
                }
            };
            addon = new Y.mojito.addons.ac.shared_model_addon(command, adapter, ac);
            A.isUndefined(addon.load('user'), 'should be undefined');
        }
    }));

    YUITest.TestRunner.add(suite);

}, '0.0.1', { requires: [
    'mojito-test',
    'mojito_mojit_addon_shared_model'
]});
