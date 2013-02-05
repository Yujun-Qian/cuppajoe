/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */

/*global YUI: true*/

'use strict';

YUI.add('yahoo_infinite_nav', function (Y, NAME) {

    Y.mojito.controllers[NAME] = {

        /*
         * This funciton is the main entry point to the app
         */
        index: function (ac) {

            var action = ac.params.route('action') || "index",
                cfg = {
                    children: {
                        feed: {
                            type: "yahoo_infinitiefeed",
                            action: action
                        }
                    }
                };

            // Now execute the composite
            ac.composite.execute(cfg, function (data, meta) {
                ac.done({
                    selectTopics: action === "selectTopics",
                    feed: data.feed
                }, meta);
            });
        },

        topics: function (ac) {

            var cfg = {
                    children: {
                        feed: {
                            type: "yahoo_infinitiefeed",
                            action: "index"
                        }
                    }
                };

            // Now execute the composite
            ac.composite.execute(cfg, function (data, meta) {
                ac.done(data.feed, meta);
            });
        },

        selectors: function (ac) {

            var cfg = {
                children: {
                    // menu: {},
                    selector: {
                        type: "yahoo_infinitiefeed",
                        action: "selectTopics"
                    }
                }
            };

            // Force the loading of the spinner ready for use.
            ac.assets.preLoadImage("/static/yahoo_infinite_nav/assets/spinner.gif");

            // Now execute the composite
            ac.composite.execute(cfg, function (data, meta) {
                ac.done(data.selector, meta);
            });
        },

        /*
         * This funciton does nothing but show the loading page.
         * 
         * Once running on the client it then invokes "index" and populates
         * the page at runtime.
         */
        loader: function (ac) {
            ac.done({}, 'loader');
        }
    };

}, '0.0.1', {requires: [
    'mojito',
    'mojito-assets-addon',
    'mojito-params-addon',
    'mojito-composite-addon',
    'mojito_mojit_addon_shared_model'
]});
