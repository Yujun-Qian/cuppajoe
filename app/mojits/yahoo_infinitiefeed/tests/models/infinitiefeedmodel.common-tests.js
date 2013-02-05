/**
 * Copyright (c) 2013 Yahoo! Inc. All rights reserved.
 */
/*jslint node:true*/
/*global YUI, YUITest*/

"use strict";

YUI.add('infinitiefeedmodel-tests', function (Y, NAME) {
    var suite = new YUITest.TestSuite(NAME),
        model,
        A = YUITest.Assert,
        OA = YUITest.ObjectAssert;

    suite.add(new YUITest.TestCase({
        name: 'infinitiefeedmodel tests',

        setUp: function () {
            // model = Y.mojito.util.copy(Y.mojito.models.infinitiefeed);
            model = Y.mojito.models.infinitiefeed;
            model.emptyCache();
        },
        tearDown: function () {
            model = null;
        },
        'test init': function () {
            var config;
            config = {
                feeds: 'FEED'
            };
            model.init(config);
            OA.areEqual(config, model.cfg, 'wrong config');
            A.areEqual(config.feeds, model.getFeedCfgs(), 'wrong feeds');
        },
        'test emptyCache': function () {

            var c,
                called = false,
                oldCache = model.getCache();
            c = {
                empty: function () {
                    called = true;
                }
            };

            model.setCache(c);
            model.emptyCache();
            A.areEqual(true, called, 'empty() was not called');

            model.setCache(oldCache);
        },
        'test getFeed': function () {
            var c,
                called = false,
                cbCalled = false,
                oldCache = model.getCache();

            c = {
                get: function (offset, limit, feedIds, callback) {
                    called = true;
                    A.areEqual(5, offset, 'offset should be 5');
                    A.areEqual(10, limit, 'limit should be 10');
                    OA.areEqual(['1', '2'], feedIds, 'feedIds mismatch');
                    callback();
                }
            };
            model.setCache(c);
            model.getFeed(['1', '2'], 5, 10, function () {
                cbCalled = true;
            });
            A.areEqual(true, called, 'get() was not called');
            A.areEqual(true, cbCalled, 'callback() was not called');

            model.setCache(oldCache);
        },

        'test cache.empty()': function () {
            var cache;

            cache = model.getCache();

            cache.store = 'XX'; // should be array
            cache.storeIndex = []; // should be object
            cache.fetched = null; // should be object
            cache.lastSent = -1; // should be 0

            cache.empty();
            A.areEqual(true, Y.Lang.isArray(cache.store), 'store should be array');
            A.areEqual(true, Y.Lang.isObject(cache.storeIndex), 'storeIndex should be object');
            A.areEqual(true, Y.Lang.isObject(cache.fetched), 'fetched should be array');
            A.areEqual(0, cache.lastSent, 'lastSent should be 0');
        },

        'test cache.fill()': function () {

            var feedIds,
                feedCfgs,
                raw,
                cache,
                oldCache,
                oldPrefill = model.getPrefill(),
                callbackCalled = false;

            raw = {
                query: {
                    count: 1,
                    results: {
                        item: [
                            {
                                title: 'TITLE',
                                description: "<p><a href=\"http://news.yahoo.com/worlds-best-big-wave-surfers-compete-mavericks-102650018--spt.html\"><img src=\"http://l2.yimg.com/bt/api/res/1.2/PUa_esZ8T9bW96WSxSFMhw--/YXBwaWQ9eW5ld3M7Zmk9ZmlsbDtoPTg2O3E9ODU7dz0xMzA-/http://media.zenfs.com/en_us/News/ap_webfeeds/a9cb48f76ed12e02270f6a706700c905.jpg\" width=\"130\" height=\"86\" alt=\"Ryan Augenstein competes during the third heat of the Mavericks Surf Competition in Half Moon Bay, Calif., Sunday, Jan. 20, 2013. (AP Photo/Marcio Jose Sanchez)\" align=\"left\" title=\"Ryan Augenstein competes during the third heat of the Mavericks Surf Competition in Half Moon Bay, Calif., Sunday, Jan. 20, 2013. (AP Photo/Marcio Jose Sanchez)\" border=\"0\" /></a>HALF MOON BAY, Calif. (AP) — As swells lumbered across the Pacific toward Northern California, nearly two dozen of the world&#039;s best big wave surfers went to meet them on Sunday, a half-mile offshore at the famed surfing break known as Mavericks.</p><br clear=\"all\"/>",
                                link: "http://news.yahoo.com/worlds-best-big-wave-surfers-compete-mavericks-102650018--spt.html",
                                pubDate: "Sun, 20 Jan 2013 18:28:21 -0500"
                            }
                        ]
                    }
                }
            };

            feedIds = [
                { feedId: 'yahootopstory' }
            ];
            feedCfgs = {
                yahootopstory: {
                    id: 'yahootopstory',
                    title: 'Yahoo! Top Story',
                    type: 'yahoo.hybrid.newsfeed',
                    action: 'index',
                    query: 'select * from internet '
                }
            };
            // cb(raw)
            Y.YQL = function (query, cb) {
                // verify query
                // console.log('QUERY: ' + query);
                cb(raw);
            };

            model.setFeedCfgs(feedCfgs);
            model.setPrefill(1);
            cache = model.getCache();

            cache.fill(feedIds, function (err) {
                A.isUndefined(err, 'error: ' + err);
                callbackCalled = true;
            });

            // TODO: verify cache content
            A.areEqual(true, callbackCalled, 'callback was not called');

            model.setPrefill(oldPrefill);
        },

        'test cache.get()': function () {
            var callbackCalled = false,
                reorderCalled = false,
                cache,
                oldFill,
                oldReorder,
                feedIds = 'FEEDS';

            cache = model.getCache();
            oldReorder = cache.reorder;
            oldFill = cache.fill;

            cache.lastSent = 7;
            cache.reorder = function () {
                reorderCalled = true;
            };
            // cb(err)
            cache.fill = function (feeds, cb) {
                A.areEqual(feedIds, feeds, 'wrong feeds: ' + feeds);
                cb();
            };
            cache.store = {
                slice: function (o, r) {
                    A.areEqual(5, o, 'offset should be 5');
                    A.areEqual(15, r, 'limit should be offset + limit');
                    return 'CACHE_OBJECT';
                }
            };

            cache.get(5, 10, feedIds, function (data) {
                callbackCalled = true;
                A.areEqual('CACHE_OBJECT', data, 'data should come from cache.store.splice');
            });

            A.areEqual(15, cache.lastSent, 'cache.lastSent should be 15');
            A.areEqual(true, callbackCalled, 'callback was not called');
            A.areEqual(true, reorderCalled, 'cache.reorder() was not called');

            cache.fill = oldFill;
            cache.reorder = oldReorder;
            cache.store = [];
        }

    }));

    YUITest.TestRunner.add(suite);

}, '0.0.1', { requires: ['mojito-test', 'mojito-util', 'infinitiefeedmodel'] });
