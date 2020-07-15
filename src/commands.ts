import * as discord from "discord.js"
import { client } from "./app"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as help from "./help/help"
import * as killerRanking from "./killerRanking/killerRanking"

// DEBUG
import * as pathfinderParse from "./pathfinderParse/pathfinderParse"
import * as esijs from "esijs"

client.on('message', async function (message: discord.Message) {
    let lowerMessage = message.content.toLowerCase();

    // If the message contains the command prefix and came from the correct channel, process it
    if (lowerMessage.slice(0, 2) == 'b!' && message.channel.id === process.env.BOT_CHANNEL) {
        // Only look at the part after the prefix, and before any other arguments
        switch (lowerMessage.slice(2).split(' ')[0]) {
            case 'help':
                help.generateHelpPage()
                break;
            case 'scanners':
                // We have two options here, so we have a little extra logic to handle that
                if (lowerMessage.slice(2).split(' ')[1] == '-all') {
                    scannerRanking.generateRanking(undefined, true);
                } else {
                    scannerRanking.generateRanking();
                }
                break;
            case 'killers':
                // We have two options here, so we have a little extra logic to handle that
                if (lowerMessage.slice(2).split(' ')[1] == '-all') {
                    killerRanking.generateRanking(undefined, true);
                } else {
                    killerRanking.generateRanking();
                }
                break;
        }
    }
})