/**
 * Copyright (c) 2013 Yahoo! Inc. All rights reserved.
 */
/*jslint node:true*/
/*global YUI, YUITest*/

"use strict";

YUI.add('infinitiefeed-tests', function (Y, NAME) {
    var suite = new YUITest.TestSuite(NAME),
        controller,
        ac,
        A = YUITest.Assert,
        OA = YUITest.ObjectAssert;

    suite.add(new YUITest.TestCase({
        name: 'infinitiefeed tests',

        setUp: function () {
            controller = Y.mojito.controllers.infinitiefeed;
            ac = new Y.mojito.MockActionContext({
                addons: [
                    'params',
                    'composite'
                ],
                models: [
                    'mojito_mojit_addon_shared_model',
                    'yahoo_hybrid_app_usermodel'
                ]
            });
        },
        tearDown: function () {
            controller = null;
            ac = null;
        },
        'test index': function () {
            A.isFunction(controller.index);

            ac = {
                composite: {
                    execute: function (cfg, cb) {
                        // A.areEqual('yahoo.hybrid.infinitiefeed', cfg.children.feed.type, 'wrong action');
                        A.areEqual('yahoo_infinitiefeed', cfg.children.feed.type, 'wrong action');
                        A.areEqual('feed', cfg.children.feed.action, 'wrong action');
                        cb('DATA');
                    }
                },
                done: function (data, meta) {
                    A.areEqual('DATA', data, 'wrong data');
                },
                params: {
                    merged: function () {}
                },
                config: {
                    get: function () {}
                }
            };
            controller.index(ac);
        },
        'test feed': function () {
            A.isFunction(controller.feed);

            var doneCalled = false,
                now = new Date().getTime() / 1000;
            /*
            ac.params.expect({
                method: 'merged',
                args: [YUITest.Mock.Value.String],
                returns: 0
            });
            */
            ac = {
                params: { merged: function () { return 0; } },
                config: { get: function () { return 5; } },
                shared_model_addon: {
                    load: function (modelName) {
                        if ('user' === modelName) {
                            return {
                                // cb(err, feedsId)
                                getConfig: function (userid, cb) {
                                    A.areEqual('user_id', userid, 'wrong user id');
                                    cb(null, 'xx');
                                }
                            };
                        }
                        // 'infinitiefeed'
                        return {
                            // cb(items)
                            getFeed: function (feedids, offset, limit, cb) {
                                A.areEqual('xx', feedids, 'wrong feedids');
                                cb([
                                    {foo: 'bar', timestamp: now},
                                    {foo1: 'bar1', timestamp: now}
                                ]);
                            }
                        };
                    }
                },
                done: function (data) {
                    var o;
                    o = {
                        items: [{foo: 'bar', timestamp: now, date: 'right now'}, {foo1: 'bar1', timestamp: now, date: 'right now'}]
                    };
                    doneCalled = true;
                    OA.areEqual(o.items[0], data.items[0], 'wrong data[0]');
                    OA.areEqual(o.items[1], data.items[1], 'wrong data[1]');
                }
            };
            controller.feed(ac);

            A.areEqual(true, doneCalled, 'done was not called');
        },
        'test selectTopics': function () {
            A.isFunction(controller.selectTopics);

            var doneCalled = false;

            ac = {
                config: {
                    get: function (c) {
                        A.areEqual('feeds', c, 'get() arg should be feeds');
                        return [
                            { id: 'foo', title: 'foo' },
                            { id: 'bar', title: 'bar' }
                        ];
                    }
                },
                shared_model_addon: {
                    load: function (m) {
                        A.areEqual('user', m, 'load() should be user');
                        return {
                            // cb(err, feedIds)
                            getConfig: function (u, cb) {
                                A.areEqual('user_id', u, 'getConfig() wrong u');
                                cb(null, [{ feedId: 'foo' }]);
                            }
                        };
                    }
                },
                done: function (data) {
                    doneCalled = true;
                    // console.log(data);
                    OA.areEqual({ id: 'foo', title: 'foo', selected: true },
                                data.feeds[1],
                                'wrong items - sort failed');
                }
            };


            controller.selectTopics(ac);
            A.areEqual(true, doneCalled, 'done was not called');
        },
        'test updateTopic': function () {
            A.isFunction(controller.updateTopic);

            var doneCalled = false,
                emptyCalled = false;

            ac = {
                done: function (data) {
                    doneCalled = true;
                    A.areEqual('done', data);
                },
                params: {
                    body: function (a) {
                        A.areEqual('feedId', a, 'body() arg should be feedId');
                        return 'FEEDID';
                    }
                },
                shared_model_addon: {
                    load: function (m) {
                        if (m === 'user') {
                            return {
                                toggleFeed: function (userid, topic, cb) {
                                    A.areEqual('user_id', userid, 'userid should be user_id');
                                    A.areEqual('FEEDID', topic, 'wrong topic');
                                    cb();
                                }
                            };
                        }
                        return {
                            emptyCache: function () { emptyCalled = true; }
                        };
                    }
                }
            };
            controller.updateTopic(ac);

            A.areEqual(true, doneCalled, 'done was not called');
            A.areEqual(true, emptyCalled, 'emptyCache() was not called');
        },

        'test toRelateTime': function () {

            var date = new Date(),
                now = date.getTime(),
                secs = now - (59 * 1000),
                min = now - (110 * 1000),
                mins = now - (3500 * 1000);


            A.areEqual('right now', controller.toRelativeTime(new Date(), date));
            A.areEqual('less than a minute before', controller.toRelativeTime(new Date(secs), date));
            A.areEqual('about a minute before', controller.toRelativeTime(new Date(min), date));
            A.areEqual('58 minutes before', controller.toRelativeTime(new Date(mins), date));
        }
    }));

    YUITest.TestRunner.add(suite);

}, '0.0.1', { requires: ['mojito-test', 'infinitiefeed'] });
