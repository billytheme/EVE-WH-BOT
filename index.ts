"use strict";
import * as discord from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as esijs from "esijs"

//We still need to record the messageID of the last parsed message for when we crash and resume

//Generic command to initialise the dotenv library
dotenv.config();

//Initialise the client
let client: discord.Client = new discord.Client();

//Create storage for the various databases
let wormholeDictionary: Record<number, Record<'source' | 'target', number>> = {};
let systemDictionary: Record<number, number> = {};
let scannerDictionary: Record<number, number> = {};
let killerDictionary: Record<number, number> = {};

//Read and parse wormhole dictionary
fs.readFile("data/wormholeDictionary.json", 'utf-8', function (err, fileData) {
    try {
        wormholeDictionary = JSON.parse(fileData);
    }
    catch (err) {
        wormholeDictionary = {}
    }
})

//Read and parse system dictionary
fs.readFile("data/systemDictionary.json", 'utf-8', function (err, fileData) {
    try {
        systemDictionary = JSON.parse(fileData)
    }
    catch (err) {
        wormholeDictionary = {}
    }
})

function writeWormholeDictionary() {
    fs.writeFile("data/wormholeDictionary.json", JSON.stringify(wormholeDictionary), function (err) {});
}

function writeSystemDictionary() {
    fs.writeFile("data/systemDictionary.json", JSON.stringify(systemDictionary), function (err) {});
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
                                wormholeDictionary[wormholeDatabaseID]['source'] = Number(source);
                                break;
                            case "target":
                                let target = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID]['target'] = Number(target);
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
                    esijs.search.search(systemName, 'solar_system', true).then((solarSystemID: Array<number>) => {
                        systemDictionary[systemDatabaseID] = solarSystemID['solar_system'][0];
                        writeSystemDictionary();
                    });
                    break;
            }
            break;
        case "Deleted":
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

client.on('message', function (message) {

    if (message.embeds.length != 0) {
        message.embeds.forEach(element => {
            if (element.footer.text === "Pathfinder API") {
                parseUpdate(element);
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
client.login(process.env.CLIENT_SECRET_KEY);