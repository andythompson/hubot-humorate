var expect = require("chai").expect;
var path   = require("path");

var Robot       = require("hubot/src/robot");
var TextMessage = require("hubot/src/message").TextMessage;

describe('Hubot-Humorate Functionality', function() {
    var robot;
    var user;
    var adapter;

    beforeEach(function(done) {
        // create new robot, without http, using the mock adapter
        robot = new Robot(null, "mock-adapter", false, "TestBot");

        robot.adapter.on("connected", function() {
            // only load scripts we absolutely need, like auth.coffee
            process.env.HUBOT_AUTH_ADMIN = "1";
            robot.loadFile(
                path.resolve(
                    path.join("node_modules/hubot/src/scripts")
                ),
                "auth.coffee"
            );

            // load the module under test and configure it for the
            // robot.  This is in place of external-scripts
            require("../index")(robot);

            // create a user
            user = robot.brain.userForId("1", {
                name: "mocha",
                room: "#mocha"
            });
            user.score = 0;
            user.count = 0;

            // create a user
            user2 = robot.brain.userForId("2", {
                name: "chai",
                room: "#mocha"
            });
            user2.score = 10;
            user2.count = 20;

            user3 = robot.brain.userForId("3", {
                name: "latte",
                room: "#mocha"
            });
            user3.score = 10;
            user3.count = 30;

            user4 = robot.brain.userForId("4", {
                name: "espresso",
                room: "#mocha"
            });
            user4.score = 10;
            user4.count = 40;

            user5 = robot.brain.userForId("5", {
                name: "redeye",
                room: "#mocha"
            });
            user5.score = 10;
            user5.count = 50;

            adapter = robot.adapter;

            setTimeout(done, 250);
        });
        robot.run();
    });

    afterEach(function() {
        robot.shutdown();
    });

    describe("Gimme da best rates", function() {

        // Test's best rates... very weirdly
        it("Best rates: top 3", function(done) {
            var expected = [
                'Best Ratings',
                'chai: 0.500',
                'latte: 0.333',
                'espresso: 0.250',
                'redeye: 0.200',
                'mocha: 0',
            ];

            process.env.HUBOT_NUM_RATINGS = 3;
            var totalCount = parseInt(process.env.HUBOT_NUM_RATINGS) + 1
            count = 0;

            setTimeout(function() {
                if ( count == totalCount ) {
                    done();
                }
                else {
                    done( new Error("Expected " + totalCount + " responses, got " + count) );
                }
            }, 100);

            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(expected[count]);
                }
                catch(e) {
                    done(e);
                }
                count++;
            });
            adapter.receive(new TextMessage(user, robot.name+' best rating'))
        });
        // Test's best rates... very weirdly
        //
        it("Best rates: top 5", function(done) {
            var expected = [
                'Best Ratings',
                'chai: 0.500',
                'latte: 0.333',
                'espresso: 0.250',
                'redeye: 0.200',
                'mocha: 0',
            ];

            process.env.HUBOT_NUM_RATINGS = 5;
            var totalCount = parseInt(process.env.HUBOT_NUM_RATINGS) + 1
            count = 0;

            setTimeout(function() {
                if ( count == totalCount ) {
                    done();
                }
                else {
                    done( new Error("Expected " + totalCount + " responses, got " + count) );
                }
            }, 100);

            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(expected[count]);
                }
                catch(e) {
                    done(e);
                }
                count++;
            });
            adapter.receive(new TextMessage(user, robot.name+' best rating'))
        });
    });

    describe("Gimme da worst rates", function() {

        // Test's worst rates... very weirdly
        it("Worst rates: bottom 3", function(done) {
            var expected = [
                'Worst Ratings',
                'mocha: 0',
                'redeye: 0.200',
                'espresso: 0.250',
                'latte: 0.333',
                'chai: 0.500',
            ];

            process.env.HUBOT_NUM_RATINGS = 3;
            var totalCount = parseInt(process.env.HUBOT_NUM_RATINGS) + 1
            count = 0;

            setTimeout(function() {
                if ( count == totalCount ) {
                    done();
                }
                else {
                    done( new Error("Expected " + totalCount + " responses, got " + count) );
                }
            }, 100);

            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(expected[count]);
                }
                catch(e) {
                    done(e);
                }
                count++;
            });
            adapter.receive(new TextMessage(user, robot.name+' Worst rating'))
        });
        // Test's worst rates... very weirdly
        //
        it("Worst rates: bottom 5", function(done) {
            var expected = [
                'Worst Ratings',
                'mocha: 0',
                'redeye: 0.200',
                'espresso: 0.250',
                'latte: 0.333',
                'chai: 0.500',
            ];

            process.env.HUBOT_NUM_RATINGS = 5;
            var totalCount = parseInt(process.env.HUBOT_NUM_RATINGS) + 1
            count = 0;

            setTimeout(function() {
                if ( count == totalCount ) {
                    done();
                }
                else {
                    done( new Error("Expected " + totalCount + " responses, got " + count) );
                }
            }, 100);

            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(expected[count]);
                }
                catch(e) {
                    done(e);
                }
                count++;
            });
            adapter.receive(new TextMessage(user, robot.name+' worst rating'))
        });
    });

    describe("Get your rate on", function() {
        it("Rate another user", function(done) {
            var rates = [
                    [ 5,  10, 0.5   ],
                    [ 10, 10, 0.75  ],
                    [ 5,  10, 0.667 ],
                    [ 1,  10, 0.525 ],
                    [ 10, 10, 0.62  ],
                    [ 0,  10, 0.517 ],
                    [ 10, 10, 0.586 ],
                    [ 10, 10, 0.637 ],
                    [ 20, 10, 0.637 ], // noop
                    [  5,  5, 0.637 ], // noop
                ],
                cur = 0,
                ok  = true;
            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(user.name + ': ' + rates[cur][2].toFixed(3));
                } catch(e) {
                    cur = rates.length;
                    ok = false;
                    done(e);
                }
            });
            for (; cur < rates.length; cur++) {
                adapter.receive(new TextMessage(user2, user.name + ': ' + rates[cur][0] + '/' + rates[cur][1]));
            }
            if (ok) {
                done();
            }
        });
        it("Rate yourself", function(done) {
            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(user.name + ': 0.500');
                    done();
                } catch(e) {
                    done(e);
                }
            });
            user.score = 10
            user.count = 10
            adapter.receive(new TextMessage(user, user.name + ': 10/10'));
        });
        it("Query a rating", function(done) {
            adapter.on("send", function(envelope, strings) {
                try {
                    expect(strings[0]).to.equal(user.name + ': 0.667');
                    done();
                } catch(e) {
                    done(e);
                }
            });
            user.score = 20
            user.count = 30
            adapter.receive(new TextMessage(user, 'rate ' + user.name));
        });
    });
})
