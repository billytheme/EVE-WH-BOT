import * as discord from "discord.js"
import { client } from "./app"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as help from "./help/help"

// DEBUG
import * as pathfinderParse from "./pathfinderParse/pathfinderParse"
import * as esijs from "esijs"

client.on('message', async function (message: discord.Message) {
    let lowerMessage = message.content.toLowerCase();

    // If the message contains the command prefix and came from the correct channel, process it
    if (lowerMessage.slice(0, 2) == 'b!' && message.channel.id === process.env.BOT_CHANNEL) {
        // Only look at the part after the prefix
        switch (lowerMessage.slice(2)) {
            case 'help':
                help.generateHelpPage()
                break;
            case 'scanners':
                scannerRanking.generateRanking();
                break;

            // DEBUG
            case 'connected':
                let descriptionString = ''

                let systems = pathfinderParse.getConnectedSystems()
                for (const system in systems) {
                    if (systems[system] !== undefined) {
                        descriptionString += (await esijs.universe.systems.systemInfo(systems[system])).name + ', '
                    }
                    else {
                        descriptionString += 'undefined' + ', '
                    }
                }

                let connectedEmbed = {
                    description: descriptionString
                }
                let channel = <discord.TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
                channel.send({ embed: connectedEmbed });
        }
    }
})