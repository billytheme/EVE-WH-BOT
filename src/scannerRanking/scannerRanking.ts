import { Message, MessageEmbed, TextChannel } from "discord.js"
import * as fs from "fs"
import { client } from "../app"
import { getCharacterName } from "../utils/utils"

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

    //Switch for the three types of message: Created, Updated, or Deleted
    //Both created and updated will give new info to store. JS allows us to treat them the same
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
                                // 0: Not specified
                                // 1: Gas
                                // 6: Combat site
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
    generateRanking();
    scannerDictionary = {}
    writeScannerDictionary();
}

export async function generateRanking() {
    // Create a list of character IDs in the dictionary
    let sortedScannerList: Array<number> = [];
    for (const characterID in scannerDictionary) {
        sortedScannerList.push(Number(characterID))
    }
    // Sort the list based on their score
    sortedScannerList.sort(function (lowerCompare, upperCompare): number {
        return scannerDictionary[upperCompare] - scannerDictionary[lowerCompare];
    })

    // Generate the ranking list
    let scannerRankingString = ''
    let currentRanking = 1

    for (const index in sortedScannerList) {
        scannerRankingString += currentRanking + ': ' + (await getCharacterName(sortedScannerList[index])) + ' - ' + scannerDictionary[sortedScannerList[index]] + ' points\n';
        currentRanking += 1;
    }

    // Get current current month
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let currentMonth = months[new Date(Date.now()).getMonth()]

    let scannerListEmbed = {
        title: "Scanner ranking for " + currentMonth,
        color: 0x1120f0,
        description: scannerRankingString
    }

    let channel = <TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
    channel.send({ embed: scannerListEmbed })
}

fs.readFile("data/scannerDictionary.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        scannerDictionary = JSON.parse(fileData)
    }
    catch (err) {
        scannerDictionary = {}
    }
})