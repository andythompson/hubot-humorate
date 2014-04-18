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
            user.score = 0
            user.count = 0

            // create a user
            user2 = robot.brain.userForId("2", {
                name: "chai",
                room: "#mocha"
            });

            adapter = robot.adapter;

            setTimeout(done, 250);
        });
        robot.run();
    });

    afterEach(function() {
        robot.shutdown();
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
