/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */

/*global YUI: true*/

'use strict';

YUI.add('infinitie_feed_binder_selectTopics', function (Y, NAME) {

    Y.namespace('mojito.binders')[NAME] = {

        init: function (mp) {
            this.mp = mp;
        },

        bind: function (node) {

            var self = this;

            if (Y.UA.ios) {
                node.delegate("touchend", function(e) {

                    var anchor = e.currentTarget;

                    anchor.setData("link", anchor.get("href"));
                    anchor.set("href", "");

                }, "a");
            }


            node.delegate("click", function (e) {

                e.preventDefault();

                var topic = e.currentTarget,
                    params = {
                        body: {
                            feedId: topic.getAttribute("data-feedId")
                        }
                    };

                topic.toggleClass("selected");

                self.mp.invoke("updateTopic", {params: params}, function (err, data) {
                    // Show a message to the user so they know if it worked
                });

                if (Y.UA.ios) {
                    topic.set("href", topic.getData("link"));
                }

            }, "a");
        }
    };

}, '0.0.1', {requires: ['mojito-client', 'node']});
