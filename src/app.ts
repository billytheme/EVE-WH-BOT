"use strict";
import * as discord from "discord.js";
import * as dotenv from "dotenv";

//Generic command to initialise the dotenv library
dotenv.config();

//Initialise the client
export let client: discord.Client = new discord.Client();

// We import events and commands strictly for side effects
// Events sets up the functions to maintain our database based on external inputs (Pathfinder, zKill)
// Commands sets up the functions to display info to the users
import "./events"
import "./commands"

client.on('message', function (message) {
    if (message.channel.id === process.env.BOT_CHANNEL) {

        if (message.content === 'b!carriers') {
            const exampleEmbed = {
                "title": "Best Carrier Killing regions",
                "description": "**THIS IS A PLACEHOLDER, NOT AN ACTUAL RANKING**\n1: Delve\n2: Deklein\n3: Fade\n4: Feythabolis\n5: Querious\n6: Vale of the Silent\n7: Geminate\n8: Detorid\n9: Stain\n10: The Kalevala Expanse\nand so on...",
                "color": 0x2aa317,
            };

            message.channel.send({ embed: exampleEmbed });
        }
    }
});

//Connect the application to discord
client.login(process.env.CLIENT_SECRET_KEY);