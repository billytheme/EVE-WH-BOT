import * as pathfinder from "./pathfinderParse/pathfinderParse"
import { client } from "./app"
import * as webSocket from "ws"
import * as zKillboardWatch from "./zKillboardWatch/zKillboardWatch"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as killerRanking from "./killerRanking/killerRanking"
import * as schedule from "node-schedule"

// Initialise the Websocket for the zKill API
let zKill = new webSocket("wss://zkillboard.com:2096")

// Subscribe to the killfeed to get kills as they happen
zKill.addEventListener('open', function () {
    zKill.send(JSON.stringify({
        "action": "sub",
        "channel": "killstream"
    }));
})

// When we get a kill from zKill, check whether the friendly alliance was involved and whether it 
// Occured in the pathfinder chain. If yes to both, then alert
zKill.addEventListener('message', zKillboardWatch.parseKill);

zKill.addEventListener('message', killerRanking.parseKill);

//If we  have errors, log them. Dunno why it closes sometimes
zKill.addEventListener('close', function (event) {
    console.error(new Date(Date.now()).toUTCString);
    console.error(event);
})

zKill.addEventListener('error', function (event) {
    console.error(new Date(Date.now()).toUTCString);
    console.error(event);
})

// When we receive a message, pass it to the parse function
client.on('message', pathfinder.parseMessage)

// Once we load, load any messages we missed while offline and parse them into memory
client.on('ready', pathfinder.catchupOnUpdates);

// When we receive a message, pass it to the parse function
client.on('message', scannerRanking.parseMessage)

// On the first of each month, reset the rankings
schedule.scheduleJob('1 1 1 * *', scannerRanking.resetRankings)
schedule.scheduleJob('1 1 1 * *', killerRanking.resetRankings)