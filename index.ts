"use strict";
import * as discord from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as esijs from "esijs"
import * as webSocket from "ws"
import * as pathfinder from "./pathfinderParse"

//Generic command to initialise the dotenv library
dotenv.config();

//Initialise the client
let client: discord.Client = new discord.Client();

//Initialise the Websocket for the zKill API
let zKill = new webSocket("wss://zkillboard.com:2096")

let scannerDictionary: Record<number, number> = {};
let killerDictionary: Record<number, number> = {};

function getAllianceName(allianceID: number): string {
    if (allianceID === undefined) {
        return "None"
    } else {
        return JSON.parse(esijs.corporation.info(allianceID)).name
    }
}

client.on('message', function (message) {
    //If the message contains embeds, have a look at them
    pathfinder.parseMessage(message);

    if (message.content === 'b!help') {
        const exampleEmbed = {
            "title": "Command list",
            "description": "Current Prefix: `b!`\n\n\
                    `help`\n\
                    Returns this list.\n\
                    If another command is used as an argument, gives specific help for the command\n\n\
                    `scanners`\n\
                    Returns the leaderboard for best scanners this month\n\n\
                    `killers`\n\
                    Returns the leaderboard for the best PvP pilots this month\n\n\
                    `carriers`\n\
                    performs a lookup for the best potential regions to kill carriers in",
            "color": 0x00e0bf,
        };

        message.channel.send({ embed: exampleEmbed });
    }

    if (message.content === 'b!scanners') {
        const exampleEmbed = {
            "title": "Scanner Ranking for June",
            "description": "1: Nosha Izia - 1000\n2: Sin Alarma - 900\n3: Primuss Elitest - 800\n4: Rand Haginen - 700\n5: Jin Jockey - 600\n6: Dackodai - 500\n7: k0rnWallace - 400\n8: Anne Navare - 300\n9: Athena Steel - 200\n10: Panther2707 - 100\nand so on...",
            "color": 0x1120f0,
        };

        message.channel.send({ embed: exampleEmbed });
    }

    if (message.content === 'b!killers') {
        const exampleEmbed = {
            "title": "PvP Pilot Ranking for June",
            "description": "1: Nosha Izia - 1000\n2: Sin Alarma - 900\n3: Primuss Elitest - 800\n4: Rand Haginen - 700\n5: Jin Jockey - 600\n6: Dackodai - 500\n7: k0rnWallace - 400\n8: Anne Navare - 300\n9: Athena Steel - 200\n10: Panther2707 - 100\nand so on...",
            "color": 0xf27f13,
        };

        message.channel.send({ embed: exampleEmbed });
    }

    if (message.content === 'b!carriers') {
        const exampleEmbed = {
            "title": "Best Carrier Killing regions",
            "description": "1: Delve\n2: Deklein\n3: Fade\n4: Feythabolis\n5: Querious\n6: Vale of the Silent\n7: Geminate\n8: Detorid\n9: Stain\n10: The Kalevala Expanse\nand so on...",
            "color": 0x2aa317,
        };

        message.channel.send({ embed: exampleEmbed });
    }

    if (message.content === 'b!alert') {
        const exampleEmbed = {
            "title": "Kitsune killed in J000000 - 4 Jumps from Deep",
            "color": 0xff0000,
            thumbnail: {
                url: 'https://images.evetech.net/types/11194/render?size=128',
            },
            "fields": [
                {
                    name: 'Attacker',
                    value: 'ExookiZ',
                    inline: true
                },
                {
                    name: 'Corporation',
                    value: 'The Dark Space Initiative',
                    inline: true
                },
                {
                    name: 'Alliance',
                    value: 'Initiative Mercenaries',
                    inline: true
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: false
                },
                {
                    name: 'Victim',
                    value: 'Braxus Deninard',
                    inline: true
                },
                {
                    name: 'Corporation',
                    value: 'Hard Knocks Inc.',
                    inline: true
                },
                {
                    name: 'Alliance',
                    value: 'Hard Knocks Citizens',
                    inline: true
                },
            ],
        };

        message.channel.send({ embed: exampleEmbed });
    }

});

//Once ready, load any messages we missed while offline and parse them into memory
client.on('ready', function () {
    pathfinder.catchupOnUpdates(client)
});

//Now that we've set the application up, we load stored data, and connect to discord



client.login(process.env.CLIENT_SECRET_KEY);

//Subscribe to the killfeed to get kills as they happen
zKill.addEventListener('open', function () {
    zKill.send(JSON.stringify({
        "action": "sub",
        "channel": "killstream"
    }));
})

//When we get a kill from zKill, check whether the friendly alliance was involved and whether it 
//Occured in the pathfinder chain. If yes to both, then alert
zKill.addEventListener('message', async function (event) {
    let killData = JSON.parse(event.data);
    //Check if the victim was part of the friendly alliance
    if (killData.victim.alliance_id !== process.env.FRIENDLY_ALLIANCE.toString()) {
        //Check if any of the attackers where part of a friendly alliance
        let containsFriendlyAttacker = false;
        (killData.attackers).forEach(attacker => {
            if (attacker.alliance_id === process.env.FRIENDLY_ALLIANCE.toString()) {
                containsFriendlyAttacker = true;
            }
        });

        if (!containsFriendlyAttacker) {
            //The kill was not generated by Exit, check for connections to the home system
            if (killData.solar_system_id in pathfinder.getConnectedSystems()) {
                //We've found a kill that was not generated by exit, in the chain to the home system.
                //Now we generate an alert

                const alertEmbed = {
                    title: JSON.parse(await esijs.universe.typeInfo(killData.victim.ship_type_id)).name
                        + " killed in " + JSON.parse(await esijs.universe.systemInfo(killData.solar_system_id)).name
                        + " - " + pathfinder.getJumpsFromHome(pathfinder.getSystemDatabaseIDFromSystemID(killData.solar_system_id))
                        + "Jumps from Deep",
                    color: 0xff0000,
                    thumbnail: {
                        url: 'https://images.evetech.net/types/' + killData.victim.ship_type_id + '/render?size=128',
                    },
                    "fields": [
                        {
                            name: 'Attacker (final blow)',
                            value: JSON.parse(await esijs.character.publicInfo(killData.attackers[0].characterID)).name,
                            inline: true
                        },
                        {
                            name: 'Corporation',
                            value: JSON.parse(esijs.corporation.info(killData.attackers[0].corporation_id)).name,
                            inline: true
                        },
                        {
                            name: 'Alliance',
                            value: getAllianceName(killData.attackers[0].alliance_id),
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: '\u200b',
                            inline: false
                        },
                        {
                            name: 'Victim',
                            value: JSON.parse(await esijs.character.publicInfo(killData.victim.characterID)).name,
                            inline: true
                        },
                        {
                            name: 'Corporation',
                            value: JSON.parse(esijs.corporation.info(killData.victim.corporation_id)).name,
                            inline: true
                        },
                        {
                            name: 'Alliance',
                            value: getAllianceName(killData.victim.alliance_id),
                            inline: true
                        },
                    ],
                };
                let channel = <discord.TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
                channel.send({ embed: alertEmbed });
            }
        }
    }
});