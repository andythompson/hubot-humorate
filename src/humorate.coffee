# Description
#   Rate users' comments
#
# Commands:
#   <user>: 1/10 - rate the comment 1/10
#   rate <user> - query a user's rating
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
