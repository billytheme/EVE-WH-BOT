import * as pathfinder from "./pathfinderParse/pathfinderParse"
import { client } from "./app"
import * as zKillboardWatch from "./zKillboardWatch/zKillboardWatch"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as killerRanking from "./killerRanking/killerRanking"
import * as schedule from "node-schedule"
import * as webSocket from "ws"
import { clearInterval } from "timers"
import { TextChannel } from 'discord.js'

let zKill: webSocket;
let reconnectGenerator: NodeJS.Timeout;
let tryingToReconnect: boolean;

function runReconnect() {
    // If the webSocket connection is broken, it will not reestablish connection, so we have to 
    // detect and reconnect manually.

    // Initialise the Websocket for the zKill API
    zKill = new webSocket("wss://zkillboard.com:2096")

    // Subscribe to the killfeed to get kills as they happen, as well as clearing the reconnect 
    // generator if it was running
    zKill.addEventListener('open', function () {
        //DEBUG
        let channel = <TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
        channel.send({ embed: { description: "Yay, the websocket has reconnected!" } })

        tryingToReconnect = false;
        clearInterval(reconnectGenerator)

        zKill.send(JSON.stringify({
            "action": "sub",
            "channel": "killstream"
        }));
    })

    // When we get a kill from zKill, check whether the friendly alliance was involved and whether it 
    // Occured in the pathfinder chain. If yes to both, then alert
    zKill.addEventListener('message', zKillboardWatch.parseKill);

    // Check whether the kill included friendly attackers, and if so update the kill rankings
    zKill.addEventListener('message', killerRanking.parseKill);

    // DEBUG: just checking if the stream might occasionally stop
    zKill.addEventListener('message', function () {
        console.log(Date.now())
    })

    // If the connection is closed, check that we are not already running the function (this is
    // because if the server is not up again yet, it will generate another close message). If not,
    // start it.
    zKill.addEventListener('close', function () {
        if (!tryingToReconnect) {
            //DEBUG
            let channel = <TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
            channel.send({ embed: { description: "Bugger, the websocket closed." } })

            tryingToReconnect = true;
            reconnectGenerator = setInterval(runReconnect, 5000);
        }
    })
}

runReconnect()

// When we receive a message, pass it to the parse function
client.on('message', pathfinder.parseMessage)

// Once we load, load any messages we missed while offline and parse them into memory
client.on('ready', pathfinder.catchupOnUpdates);

// When we receive a message, pass it to the parse function
client.on('message', scannerRanking.parseMessage)

// On the first of each month, reset the rankings
schedule.scheduleJob('1 1 1 * *', scannerRanking.resetRankings)
schedule.scheduleJob('1 1 1 * *', killerRanking.resetRankings)