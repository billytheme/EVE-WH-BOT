import { isfriendlyAttackers } from "../utils/utils"
import * as fs from "fs"
import { client } from "../app"
import { getCharacterName } from "../utils/utils"
import { TextChannel } from "discord.js"

let killerDictionary: Record<number, number> = {};

export async function parseKill(event: { data: any; type: string; }) {
    let killData = JSON.parse(event.data);

    if (isfriendlyAttackers(killData)) {
        for (const attackerIndex in killData.attackers) {
            if (killData.attackers[attackerIndex].alliance_id.toString() === process.env.FRIENDLY_ALLIANCE) {
                if (killerDictionary[killData.attackers[attackerIndex].character_id] === undefined) {
                    killerDictionary[killData.attackers[attackerIndex].character_id] = 1;
                } else {
                    killerDictionary[killData.attackers[attackerIndex].character_id] += 1;
                }
            }
        }
        writeKillerDictionary()
    }
}

export function resetRankings() {
    // Generate the ranking and send it to discord, reset the rankings, and 
    // write the new (empty dictionary)

    // Force the previous month, as this will be run in the new month, but be about the old month
    generateRanking(new Date(Date.now()).getMonth() - 1);
    killerDictionary = {}
    writeKillerDictionary();
}

export async function generateRanking(forceMonth: number = undefined) {
    // Create a list of character IDs in the dictionary
    let sortedKillerList: Array<number> = [];
    for (const characterID in killerDictionary) {
        sortedKillerList.push(Number(characterID))
    }
    // Sort the list based on their score
    sortedKillerList.sort(function (lowerCompare, upperCompare): number {
        return killerDictionary[upperCompare] - killerDictionary[lowerCompare];
    })

    // Generate the ranking list
    let killerRankingString = ''
    let currentRanking = 1

    for (const index in sortedKillerList) {
        killerRankingString += currentRanking + ': ' + (await getCharacterName(sortedKillerList[index])) + ' - ' + killerDictionary[sortedKillerList[index]] + ' points\n';
        currentRanking += 1;
    }

    let currentMonth: string
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Get current current month
    if (forceMonth == undefined) {
        currentMonth = months[new Date(Date.now()).getMonth()]
    } else {
        currentMonth = months[forceMonth]
    }

    let killerListEmbed = {
        title: "PvP ranking for " + currentMonth,
        color: 0x1120f0,
        description: killerRankingString
    }

    let channel = <TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
    channel.send({ embed: killerListEmbed })
}

function writeKillerDictionary() {
    // Write the scannerDictionary to a file to load later
    fs.writeFileSync("data/killerDictionary.json", JSON.stringify(killerDictionary));
}

fs.readFile("data/killerDictionary.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        killerDictionary = JSON.parse(fileData)
    }
    catch (err) {
        killerDictionary = {}
    }
})