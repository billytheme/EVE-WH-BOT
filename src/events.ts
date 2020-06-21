import * as pathfinder from "./pathfinderParse/pathfinderParse"
import { client } from "./app"
import * as webSocket from "ws"
import * as zKillboardWatch from "./zKillboardWatch/zKillboardWatch"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as discord from "discord.js"
import * as schedule from "node-schedule"

//Initialise the Websocket for the zKill API
let zKill = new webSocket("wss://zkillboard.com:2096")

//Subscribe to the killfeed to get kills as they happen
zKill.addEventListener('open', function () {
    zKill.send(JSON.stringify({
        "action": "sub",
        "channel": "killstream"
    }));
})

//When we get a kill from zKill, check whether the friendly alliance was involved and whether it 
//Occured in the pathfinder chain. If yes to both, then alert
zKill.addEventListener('message', zKillboardWatch.parseKill);

//When we receive a message, pass it to the parse function
client.on('message', pathfinder.parseMessage)

//Once we load, load any messages we missed while offline and parse them into memory
client.on('ready', pathfinder.catchupOnUpdates);

client.on('message', scannerRanking.parseMessage)

client.on('message', function (message: discord.Message) {
    let lowerMessage = message.content.toLowerCase();

    if (lowerMessage.slice(0, 2) == 'b!') {
        switch (lowerMessage.slice(2)) {
            case 'scanners':
                scannerRanking.generateRanking();
        }
    }
})

schedule.scheduleJob('* * 1 * *', scannerRanking.resetRankings)