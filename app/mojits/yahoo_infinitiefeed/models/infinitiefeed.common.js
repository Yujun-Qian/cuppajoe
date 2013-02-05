/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */

/*jslint regexp: true */

/*global YUI: true*/

'use strict';

YUI.add('infinitiefeedmodel', function (Y, NAME) {

    var preFill = 0,
        feedCfgs = {},
        cache = {}; // Holds all the data

    function truncate(str, len) {
        var truncated = str;

        if (len < str.length) {
            truncated = str.substr(0, len); // End at a space.

            // Add ellipsis if needed. Avoid adding after punctuation.
            if (truncated.charAt(truncated.length - 1) !== '.') {
                truncated = truncated.substr(0, truncated.lastIndexOf(' '));
            }

            if (truncated.charAt(truncated.length - 1).search(/[.,;!?]/)) {
                truncated += '...';
            }
        }
        return truncated;
    }

    function format(text, len) {
        if (text) {
            text = text.replace(/&amp;/g, "&");
            text = text.replace(/&#039;/g, "'");
            text = text.replace(/&quot;/g, '"');
            text = truncate(text.replace(/<\/?[a-z]+[^>]*>/gi, ''), len);
        }

        return text;
    }

    /*
        The Cache Object
    */

    cache.store = [];

    /*
        The Cache Objects Index
    */

    cache.storeIndex = {};

    /*
        A map of feedIds that have been fetched allready

        <feedId>: <timestamp>
    */

    cache.fetched = {};

    /*
        The item shown to the user.

        This is used when mixing in new feeds content.
    */

    cache.lastSent = 0;

    /*
        Empty all cache data
    */

    cache.empty = function () {
        cache.store = [];
        cache.storeIndex = {};
        cache.fetched = {};
        cache.lastSent = 0;
    };

    /*
        Checks if the given key is in the cache
    */

    cache.exists = function (key) {
        return cache.storeIndex[key] ? true : false;
    };

    /*
        Reorder the cache by date ONLY after the last seen item
    */

    cache.reorder = function (from) {

        // Y.log("from: " + from, "warn");

        if (from === undefined) {
            from = cache.lastSent;
        }

        // Y.log("from: " + from, "warn");

        var oldItems = cache.store.slice(0, from),
            newItems = cache.store.slice(from);

        // Y.log("before: " + cache.store.length, "warn");

        newItems.sort(function (a, b) {
            return b.timestamp - a.timestamp;
        });

        cache.store = oldItems.concat(newItems);

        // Y.log("after: " + cache.store.length, "warn");
    };

    /*
        Fill the cache
    */

    cache.fill = function (feedIds, callback) {

        var feedId,
            feedCfg,
            lastUpdate,
            query;

        // First check which feed to get by walking the ordered feedIds list.
        Y.Array.each(feedIds, function (feed) {
            if (!feedId && !cache.fetched[feed.feedId]) {
                feedId = feed.feedId;
            }
        });

        // If we didn't get a feedId then find the oldest
        if (!feedId) {
            lastUpdate = new Date().getTime();
            Y.Object.each(cache.fetched, function (val, id) {
                if (val < lastUpdate) {
                    feedId = id;
                    lastUpdate = val;
                }
            });

            // Before we use what we got check we updated it in
            // the past 1 minute (60000 milliseconds).
            if (cache.fetched[feedId] + 60000 > new Date().getTime()) {
                feedId = null;
            }
        }

        feedCfg = feedCfgs[feedId];

        if (!feedId) {
            callback("No Feed ID available for reading.");
            return;
        }

        query = feedCfg.query + " limit 100";

        Y.YQL(query, function (raw) {

            var items;

            if ((raw.query && !raw.query.count) || !raw.query.results.item) {
                callback("Error executing YQL query: " + query);
            } else {
                // This is here for debugging only
                Y.log("Executed YQL query: " + query, "info");
            }

            items = raw.query.results.item;

            Y.Array.each(items, function (item, index) {

                var src = (item.content) ? item.content.url : '';

                if (!cache.exists(item.link)) {
                    cache.storeIndex[item.link] = {
                        title: item.title,
                        body: format(item.description, 240),
                        imgSrc: src,
                        url: item.link,
                        date: item.pubDate,
                        timestamp: Math.round(Date.parse(item.pubDate) / 1000),
                        group: feedCfgs[feedId].title
                    };

                    cache.store.push(cache.storeIndex[item.link]);
                }
            });

            cache.fetched[feedId] = new Date().getTime();

            if (Y.Object.size(cache.fetched) < preFill) {
                cache.fill(feedIds, callback);
            } else {
                cache.reorder();
                callback();
            }
        });
    };

    /*
        Get items form the cache
    */

    cache.get = function (offset, limit, feedIds, callback) {

        if (offset < cache.lastSent) {
            cache.lastSent = offset;
            cache.reorder();
        }

        cache.fill(feedIds, function (err) {

            cache.lastSent = offset + limit;

            // Y.log("offset: " + offset + " limit:" + limit, "warn");
            // Y.log("cache.lastSent: " + cache.lastSent, "warn");
            // Y.log("cache.store.length: " + cache.store.length, "warn");

            if (err) {
                Y.log(err, "warn");
            }

            callback(cache.store.slice(offset, offset + limit));
        });
    };

    Y.mojito.models.infinitiefeed = {

        init: function (config) {
            this.cfg = config;
            feedCfgs = config.feeds;
        },

        emptyCache: function () {
            cache.empty();
        },

        getFeed: function (feedIds, offset, limit, callback) {

            offset = parseInt(offset, 10) || 0;
            limit = parseInt(limit, 10) || this.cfg.limit || 10;

            if (!Y.Array.test(feedIds) || feedIds.length <= 0) {
                feedIds = this.cfg.feedIds;
            }

            cache.get(offset, limit, feedIds, callback);
        },

        // For unit tests
        setFeedCfgs: function (feeds) {
            feedCfgs = feeds;
        },
        getFeedCfgs: function () {
            return feedCfgs;
        },
        getCache: function () {
            return cache;
        },
        setCache: function (c) {
            cache = c;
        },
        setPrefill: function (fill) {
            preFill = fill;
        },
        getPrefill: function () {
            return preFill;
        }
    };

}, '0.0.1', {
    requires: ['yql']
});
