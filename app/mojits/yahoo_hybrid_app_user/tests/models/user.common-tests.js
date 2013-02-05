/**
 * Copyright (c) 2013 Yahoo! Inc. All rights reserved.
 */
/*jslint node:true*/
/*global YUI, YUITest*/

"use strict";

YUI.add('yahoo_hybrid_app_usermodel-tests', function (Y, NAME) {
    var suite = new YUITest.TestSuite(NAME),
        model,
        A = YUITest.Assert,
        OA = YUITest.ObjectAssert;

    suite.add(new YUITest.TestCase({
        name: 'yahoo_hybrid_app_usermodel tests',

        setUp: function () {
            model = Y.mojito.models.user;
        },
        tearDown: function () {
            model = null;
        },
        'test init': function () {
            var c;
            c = { foo: 'bar' };
            model.init(c);
            OA.areEqual(c, model.cfg, 'config does not match');
        },
        'test setUser with non-null values in config': function () {
            var users,
                config,
                addCalled = false;
            users = {
                add: function (userid, users) {
                    addCalled = true;
                    A.areEqual('user_id', userid, 'userid does not match');
                    OA.areEqual(['1', '2'], users, 'users does not match');
                }
            };
            config = ['1', '2'];
            model.setUsers(users);

            model.setUser('user_id', config);

            A.areEqual(true, addCalled, 'users.add was not called');
        },
        'test setUser with NULL values in config': function () {
            var users,
                config,
                addCalled = false;
            users = {
                add: function (userid, users) {
                    addCalled = true;
                    A.areEqual('user_id', userid, 'userid does not match');
                    OA.areEqual(['1', '2'], users, 'users does not match');
                }
            };
            config = ['1', null, '2'];
            model.setUsers(users);

            model.setUser('user_id', config);

            A.areEqual(true, addCalled, 'users.add was not called');
        },

        'test getUser with empty cache': function () {
            var users,
                res,
                retrieveCalled = false;
            users = {
                retrieve: function (userid) {
                    A.areEqual('userid', userid, 'userid has wrong value');
                    retrieveCalled = true;
                    return undefined;
                }
            };
            model.setUsers(users);

            res = model.getUser('userid');
            OA.areEqual([], res, 'res should be empty array');
            A.areEqual(true, retrieveCalled, 'user.retrieve was not called');
        },
        'test getUser with non-empty cache': function () {
            var users,
                res;
            users = {
                retrieve: function (userid) {
                    return {
                        response: { foo: 'bar' }
                    };
                }
            };
            model.setUsers(users);

            res = model.getUser('userid');
            OA.areEqual({ foo: 'bar' }, res, 'res has wrong object');
        },
        'test getConfig': function () {

            var getUserCalled = false,
                called = false;

            model.getUser = function (u) {
                getUserCalled = true;
                A.areEqual('userid', u, 'wrong userid');
                return [{ foo: 'bar' }];
            };
            model.getConfig('userid', function (err, user) {
                called = true;
                A.isNull(err, 'err should be null');
                OA.areEqual({ foo: 'bar' }, user[0], 'wrong user');
            });
            A.areEqual(true, getUserCalled, 'model.getUser was not called');
            A.areEqual(true, called, 'callback was not called');
        },
        'test toggleFeed with empty Feed': function () {
            A.isFunction(model.toggleFeed);

            var called = false;
            model.getUser = function () {
                return { foo: 'bar' };
            };
            model.toggleFeed('user123', null, function () {
                called = true;
            });
            
            A.areEqual(true, called, 'callback was not called');
        },
        'test toggleFeed with non empty Feed dupe feed': function () {
            A.isFunction(model.toggleFeed);

            var called = false,
                getCalled = false,
                setCalled = false;

            model.getUser = function () {
                getCalled = true;
                return [{ feedId: 'foo' }, { feedId: 'bar' }];
            };
            model.setUser = function (userid, topics) {
                setCalled = true;
                A.areEqual('user123', userid, 'wrong userid in setUser');
                A.isUndefined(topics[0]);
                OA.areEqual({ feedId: 'bar' }, topics[1], 'wrong topic');
            };
            model.toggleFeed('user123', 'foo', function () {
                called = true;
            });
            
            A.areEqual(true, called, 'callback was not called');
            A.areEqual(true, getCalled, 'getUser was not called');
            A.areEqual(true, setCalled, 'setUser was not called');
            
        },
        'test toggleFeed with non empty Feed new feed': function () {
            A.isFunction(model.toggleFeed);

            var called = false,
                getCalled = false,
                setCalled = false;

            model.getUser = function () {
                getCalled = true;
                return [{ feedId: 'foo' }, { feedId: 'bar' }];
            };
            model.setUser = function (userid, topics) {
                setCalled = true;
                A.areEqual(3, topics.length, 'expecting 3 topics');
                OA.areEqual({ feedId: 'fooz' }, topics[2], 'wrong topic');
            };
            model.toggleFeed('user123', 'fooz', function () {
                called = true;
            });
            
            A.areEqual(true, called, 'callback was not called');
            A.areEqual(true, getCalled, 'getUser was not called');
            A.areEqual(true, setCalled, 'setUser was not called');
            
        },
        'test getUsers': function () {
            model.setUsers('FOO');
            A.areEqual('FOO', model.getUsers(), 'wrong getUsers()');
        }
    }));

    YUITest.TestRunner.add(suite);

}, '0.0.1', { requires: ['mojito-test', 'yahoo_hybrid_app_usermodel', 'array-extras'] });
