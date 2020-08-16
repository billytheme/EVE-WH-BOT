import { Message, MessageEmbed, TextChannel } from "discord.js"
import * as fs from "fs"
import { sendRankingList, getCharacterName } from "../utils/utils"

//1 point for scanning a signature to group
//1 point for scanning a wormhole and jumping it (in addition)
let scannerDictionary: Record<number, number> = {};

export function parseMessage(message: Message) {
    // Checks the message came from the correct channel and that it contains embeds
    if (message.embeds.length !== 0 && message.channel.id === process.env.UPDATES_CHANNEL) {
        message.embeds.forEach(element => {
            parseUpdate(element);
        });
    }
}

function parseUpdate(embed: MessageEmbed) {
    // Check whether the update details either a new connection or new signature, and add 
    // 1 point to the relevant character if so

    // Switch for the three types of message: Created, Updated, or Deleted
    // Both created and updated will give new info to store. JS allows us to treat them the 
    // same by omitting the "break" after Created
    switch (embed.title.split(' ')[0]) {
        case "Created":
        case "Updated":
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    embed.description.replace(/`/g, '').split(',').forEach(element => {
                        switch (element.slice(0, element.lastIndexOf(':')).trim()) {
                            // We simply check for the source being updated to add points,
                            // as this will occur only when a connection is created
                            case "source":
                                let characterID = embed.author.name.slice(embed.author.name.indexOf('#') + 1,
                                    embed.author.name.length);

                                // If the character already has a score, increase it, otherwise set it to 1
                                if (scannerDictionary[characterID] !== undefined) {
                                    scannerDictionary[characterID] += 1;
                                } else {
                                    scannerDictionary[characterID] = 1;
                                }
                                break;
                        }
                    });
                    break;
                case "signature":
                    embed.description.replace(/`/g, '').split(',').forEach(element => {
                        switch (element.slice(0, element.lastIndexOf(':')).trim()) {
                            case "groupId":
                                // Check that the signature is one that needs to be scanned.
                                // 0: Not scanned
                                // 1: Combat site, shows up without being scanned
                                // 6: Ore site, shows up without being scanned
                                if (element.slice(element.lastIndexOf('➜') + 1).trim() !== '0'
                                    && element.slice(element.lastIndexOf('➜') + 1).trim() !== '1'
                                    && element.slice(element.lastIndexOf('➜') + 1).trim() !== '6') {
                                    let characterID = embed.author.name.slice(embed.author.name.indexOf('#') + 1,
                                        embed.author.name.length);

                                    // If the character already has a score, increase it, otherwise set it to 1
                                    if (scannerDictionary[characterID] !== undefined) {
                                        scannerDictionary[characterID] += 1;
                                    } else {
                                        scannerDictionary[characterID] = 1;
                                    }
                                }
                                break;
                        }
                    });
                    break;
            }

            // Write the updated dictionary to file
            writeScannerDictionary();
            break;
    }
}

function writeScannerDictionary() {
    // Write the scannerDictionary to a file to load later
    fs.writeFileSync("data/scannerDictionary.json", JSON.stringify(scannerDictionary));
}

export function resetRankings() {
    // Generate the ranking and send it to discord, reset the rankings, and 
    // write the new (empty dictionary)

    // Force the previous month, as this will be run in the new month, but be about the old month
    generateRanking(new Date(Date.now()).getMonth() - 1, true);
    scannerDictionary = {}
    writeScannerDictionary();
}

export async function generateRanking(forceMonth?: number, fullList?: boolean) {
    // Since JS does not give any easy ways to convert from month integer to month string, 
    // we have an array to convert from one to the other
    let currentMonth: string
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Get current current month. Sometimes we force the month, such as when we are generating 
    // final reports from the previous month
    if (forceMonth === undefined) {
        currentMonth = months[new Date(Date.now()).getMonth()]
    } else {
        currentMonth = months[forceMonth]
    }

    sendRankingList(scannerDictionary, fullList, "Scanner Ranking for " + currentMonth)
}

// Read the signature data from file on load
fs.readFile("data/scannerDictionary.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        scannerDictionary = JSON.parse(fileData)

        // Request all character IDs currently in the ranking list to generate a cache and increase the speed of retrieval
        for (let characterID in scannerDictionary) {
            getCharacterName(parseInt(characterID))
        }
    }
    catch (err) {
        scannerDictionary = {}
    }
})

