# Description
#   Rate users' comments
#
# Environment Variables
#   HUBOT_NUM_RATINGS - number of ratings to display, defaults to 5
#
# Commands:
#   <user>: 1/10 - rate the comment 1/10
#   rate <user> - query a user's rating
#   best/worst rating - displays top/bottom X users
#
# Notes:
#  TBD
#
# Author:
#   https://github.com/djoser/

module.exports = (robot) ->
    # base 10 y'all
    baseCount = 10

    robot.hear /^([^:]+):\s+(\d+)\/(\d+)$/, (msg) ->
        score = parseInt(msg.match[2])
        count = parseInt(msg.match[3])

        targetUser = robot.brain.userForName msg.match[1].trim()
        if !targetUser
            return

        thisUser = msg.message.user
        if targetUser is thisUser
            score = 0

        if count == baseCount && score <= baseCount
            if !targetUser.score
                targetUser.score = 0
            if !targetUser.count
                targetUser.count = 0
            targetUser.score += score
            targetUser.count += count

        currentScore = (targetUser.score / targetUser.count).toFixed(3)
        msg.send("#{targetUser.name}: #{currentScore}")

    robot.hear /^rate\s+(\S+)$/, (msg) ->
        targetUser = robot.brain.userForName msg.match[1].trim()
        if !targetUser
            return
        currentScore = (targetUser.score / targetUser.count).toFixed(3)
        msg.send("#{targetUser.name}: #{currentScore}")

    robot.respond /best\srating/i, (msg) ->
        topUsers = top()
        msg.send("Best Ratings")
        for user in topUsers
            msg.send(" #{user.name}: #{user.currentScore}")

    robot.respond /worst\srating/i, (msg) ->
        bottomUsers = bottom()
        msg.send("Worst Ratings")
        for user in bottomUsers
            msg.send(" #{user.name}: #{user.currentScore}")

    top = () ->
        users = userScores()
        users.sort (a,b) ->
            if a.currentScore < b.currentScore
                return 1
            if a.currentScore > b.currentScore
                return -1
            return 0
        return users.slice(0, ( process.env.HUBOT_NUM_RATINGS or 5 ))

    bottom = () ->
        users = userScores()
        users.sort (a,b) ->
            if a.currentScore > b.currentScore
                return 1
            if a.currentScore < b.currentScore
                return -1
            return 0
        return users.slice(0, ( process.env.HUBOT_NUM_RATINGS or 5 ))

    # Grabs a list of users and general info
    # [ { id: '1', name: 'mocha', currentScore: 0.382 },
    #   { id: '5', name: 'redeye', currentScore: 0.500 } ]
    userScores = () ->
        users = []

        # Go through the list of users
        for userId, data of robot.brain.data.users
            currentScore = 0

            # No count, no score
            if ( data.count && data.count > 0 )
                currentScore = (data.score / data.count).toFixed(3)

            # push them onto array for use
            users.push(
                id: userId,
                name: data.name,
                currentScore: currentScore
            )

        return users
