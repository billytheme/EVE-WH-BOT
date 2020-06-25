import * as discord from "discord.js"
import {client} from "./app"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as help from "./help/help"

client.on('message', function (message: discord.Message) {
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
        }
    }
})