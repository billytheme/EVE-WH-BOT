"use strict";
import * as discord from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as esijs from "esijs"
import * as WebSocket from "ws"

//Generic command to initialise the dotenv library
dotenv.config();

//Initialise the client
let client: discord.Client = new discord.Client();

//Initialise the Websocket for the zKill API
let zKill = new WebSocket("wss://zkillboard.com:2096")

//Create storage for the various databases
let wormholeDictionary: Record<number, Record<'source' | 'target', number>> = {};
let systemDictionary: Record<number, number> = {};
let scannerDictionary: Record<number, number> = {};
let killerDictionary: Record<number, number> = {};

function writeWormholeDictionary() {
    fs.writeFileSync("data/wormholeDictionary.json", JSON.stringify(wormholeDictionary));
}

function writeSystemDictionary() {
    fs.writeFileSync("data/systemDictionary.json", JSON.stringify(systemDictionary));
}

function writeLastParsedMessage(messageID: string) {
    fs.writeFile('data/lastParsedMessage.txt', messageID, function (err) {
        if (err) {
            console.error(err);
        }
    })
}

function readLastParsedMessage(): string {
    try {
        let lastParsedMessage: string = fs.readFileSync('data/lastParsedMessage.txt', 'utf-8')
        return lastParsedMessage;
    }
    catch (err) {
        return "";
    }
}

function parseUpdate(embed: discord.MessageEmbed) {
    //Switch for the three types of message: Created, Updated, or Deleted
    //Both created and updated will give new info to store. JS allows us to treat them the same
    switch (embed.title.split(' ')[0]) {
        case "Created":
        case "Updated":
            //Switch for either:
            //  connection: Create a new ID (for identification when deleting), and source and target system
            //  system: Create new ID (for identification when deleting), and EvE system ID
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    const wormholeDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    //Initialise the record if not already existing
                    if (wormholeDictionary[wormholeDatabaseID] === undefined) {
                        wormholeDictionary[wormholeDatabaseID] = { 'source': undefined, 'target': undefined }
                    }
                    //Loop through the information provided and store it
                    //we only care about the source and target here
                    embed.description.replace(/`/g, '').split(',').forEach(element => {
                        let debug = element.slice(0, element.lastIndexOf(':')).trim()
                        switch (element.slice(0, element.lastIndexOf(':')).trim()) {
                            case "source":
                                let source = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID].source = Number(source);
                                break;
                            case "target":
                                let target = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID].target = Number(target);
                                break;
                        }
                    });

                    writeWormholeDictionary();
                    break;
                case "system":
                    //Grab the system database ID and name from the message, then translate the name to an eve ID
                    //We don't need to worry about the contents of the description, as we only care about the 
                    //database ID to eve ID mapping
                    const systemDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    const systemName = embed.title.slice(embed.title.indexOf("'") + 1, embed.title.lastIndexOf("'"))
                    esijs.search.search(systemName, 'solar_system', true).then((solarSystemID) => {
                        systemDictionary[systemDatabaseID] = solarSystemID.solar_system[0];
                        writeSystemDictionary();
                    });
                    break;
            }
            break;
        case "Deleted":
            //When we delete, we only want to parse the Database ID so we can delete the entry
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    //Parse the wormhole ID and delete it from memory
                    const wormholeDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    delete wormholeDictionary[wormholeDatabaseID];
                    writeWormholeDictionary();
                    break;
                case "system":
                    //Parse the system Database ID and delete it from memory
                    const systemDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    delete systemDictionary[systemDatabaseID];
                    writeSystemDictionary();
                    break;
            }
            break;
    }
}

function getConnectedSystems(): Array<number> {
    let connectedSystems = [Number(process.env.HOME_SYSTEM)];

    let foundNewConnections: boolean;
    do {
        foundNewConnections = false;
        for (const wormhole in wormholeDictionary) {
            if (wormholeDictionary[wormhole].source in connectedSystems) {
                connectedSystems.concat(systemDictionary[wormholeDictionary[wormhole].target]);
                foundNewConnections = true;
            }
            if (wormholeDictionary[wormhole].target in connectedSystems) {
                connectedSystems.concat(systemDictionary[wormholeDictionary[wormhole].source]);
                foundNewConnections = true;
            }
        };
    } while (foundNewConnections);

    return connectedSystems;
}

function getJumpsFromHome(system: number) {
    let connectedSystems = [Number(process.env.HOME_SYSTEM)];
    let jumpsFromHome = 0;

    if (system in getConnectedSystems()) {
        if (system === Number(process.env.HOMESYSTEM)) {
            return 0;
        }

        let foundTarget = false;
        while (!foundTarget) {
            jumpsFromHome += 1;

            for (const wormhole in wormholeDictionary) {
                let wormholeObject = wormholeDictionary[wormhole];
                if (wormholeObject.source in connectedSystems) {
                    connectedSystems.concat(systemDictionary[wormholeObject.source]);
                    if (wormholeObject.target === system) {
                        foundTarget = true;
                    }
                }
                if (wormholeObject.target in connectedSystems) {
                    connectedSystems.concat(systemDictionary[wormholeObject.source]);
                    if (wormholeObject.target === system) {
                        foundTarget = true;
                    }
                }
            };
        }

        return jumpsFromHome;
    }
    else {
        return null;
    }
}

function getSystemDatabaseIDFromSystemID(systemID: number): number {
    (Object.keys(systemDictionary)).forEach(systemDatabaseID => {
        if (systemDictionary[systemDatabaseID] === systemID) {
            return systemDatabaseID;
        }
    });
    return null;
}

function getAllianceName(allianceID: number): string {
    if (allianceID === undefined) {
        return "None"
    } else {
        return JSON.parse(esijs.corporation.info(allianceID)).name
    }
}

client.on('message', function (message) {

    //If the message contains embeds, have a look at them
    if (message.embeds.length != 0) {
        message.embeds.forEach(element => {
            //Rudimentary check that the embed came from the Pathfinder API. Needs to be improved
            if (element.footer.text === "Pathfinder API") {
                parseUpdate(element);
                writeLastParsedMessage(message.id);
            }
        });
    }




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
    let lastParsedMessage = readLastParsedMessage();
    if (lastParsedMessage !== undefined && lastParsedMessage !== '') {
        let channel = <discord.TextChannel>client.channels.cache.get(process.env.UPDATES_CHANNEL);
        channel.messages.fetch({ after: readLastParsedMessage() }).then(function (messages) {
            messages.array().reverse().forEach(message => {
                message.embeds.forEach(embed => {
                    //Rudimentary check that the embed came from the Pathfinder API. Needs to be improved
                    if (embed.footer.text === "Pathfinder API") {
                        parseUpdate(embed);
                    }
                });
                writeLastParsedMessage(message.id);
            });
        })
    }
});

//Now that we've set the application up, we load stored data, and connect to discord

//Read and parse wormhole dictionary
fs.readFile("data/wormholeDictionary.json", 'utf-8', function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        wormholeDictionary = JSON.parse(fileData);
    }
    catch (err) {
        wormholeDictionary = {}
    }
})

//Read and parse system dictionary
fs.readFile("data/systemDictionary.json", 'utf-8', function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        systemDictionary = JSON.parse(fileData)
    }
    catch (err) {
        wormholeDictionary = {}
    }
    systemDictionary[process.env.HOME_SYSTEM_DATABASE_ID] = process.env.HOME_SYSTEM;
})

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
zKill.addEventListener('message', async function a(event) {
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
            console.log(killData)
            //The kill was not generated by Exit, check for connections to the home system
            if (killData.solar_system_id in getConnectedSystems()) {
                //We've found a kill that was not generated by exit, in the chain to the home system.
                //Now we generate an alert

                const alertEmbed = {
                    title: JSON.parse(await esijs.universe.typeInfo(killData.victim.ship_type_id)).name
                        + " killed in " + JSON.parse(await esijs.universe.systemInfo(killData.solar_system_id)).name
                        + " - " + getJumpsFromHome(getSystemDatabaseIDFromSystemID(killData.solar_system_id))
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