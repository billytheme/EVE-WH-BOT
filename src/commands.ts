import * as discord from "discord.js"
import { client } from "./app"
import * as scannerRanking from "./scannerRanking/scannerRanking"
import * as help from "./help/help"
import * as killerRanking from "./killerRanking/killerRanking"
import { TextChannel } from "discord.js"

// No commands necessary atm, don't bother parsing for messages

// client.on('message', async function (message: discord.Message) {
//     let lowerMessage = message.content.toLowerCase();

//     // If the message contains the command prefix and came from the correct channel, process it
//     if (lowerMessage.slice(0, 2) == 'b!' && message.channel.id === process.env.SCANNER_CHANNEL) {
//         // Only look at the part after the prefix, and before any other arguments
//         switch (lowerMessage.slice(2).split(' ')[0]) {
//             case 'help':
//                 help.generateHelpPage()
//                 break;
//             case 'scanners':
//                 // We have two options here, so we have a little extra logic to handle that
//                 if (lowerMessage.slice(2).split(' ')[1] == '-all') {
//                     scannerRanking.generateRanking(undefined, true);
//                 } else {
//                     scannerRanking.generateRanking();
//                 }
//                 break;
//             case 'killers':
//                 // We have two options here, so we have a little extra logic to handle that
//                 if (lowerMessage.slice(2).split(' ')[1] == '-all') {
//                     killerRanking.generateRanking(undefined, true);
//                 } else {
//                     killerRanking.generateRanking();
//                 }
//                 break;
//             // TEMP
//             case 'update':
//                 killerRanking.resetRankings()
//                 scannerRanking.resetRankings()
//                 break;
//             default:
//                 // This is if the user uses the prefix b! but without a valid operation attached
//                 let errorEmbed = {
//                     title: "Error: Unrecognized command",
//                     color: 0x1120f0,
//                     description: "Please ensure a you use a valid command. For a list of valid commands, run `b!help`"
//                 }

//                 let channel = <TextChannel>client.channels.cache.get(process.env.SCANNER_CHANNEL);
//                 channel.send({ embed: errorEmbed })
//                 break;
//         }
//     }
// })