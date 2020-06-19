"use strict";
import * as discord from "discord.js";
import * as dotenv from "dotenv";

//Generic command to initialise the dotenv library
dotenv.config();

//Initialise the client
export let client: discord.Client = new discord.Client();

import "./zKillboardWatch/events"
import "./pathfinderParse/events"

let scannerDictionary: Record<number, number> = {};
let killerDictionary: Record<number, number> = {};

client.on('message', function (message) {

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

//Now that we've set the application up, connect to discord
client.login(process.env.CLIENT_SECRET_KEY);