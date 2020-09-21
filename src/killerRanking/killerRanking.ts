import { isfriendlyAttackers } from "../utils/utils"
import * as fs from "fs"
import { updateRankingList, getCharacterName } from "../utils/utils"
import { Snowflake, TextChannel } from "discord.js"
import { client } from "../app"

// 1 point per kill
let killerDictionary: Record<number, number> = {};

// Array containing the messageIDs containing this month's rankings
let rankingMessagesIDs: Array<Snowflake> = []

export function parseKill(event: { data: any, type: string }) {
    // parse the stringified data into an object we can process
    let killData = JSON.parse(event.data);

    // If the kill has a friendly attacker, we want to find their character ID, add one to 
    // corresponding dictionary entry if it exists, or create and set it to one if it does not
    if (isfriendlyAttackers(killData)) {
        for (const attackerIndex in killData.attackers) {
            if (killData.attackers[attackerIndex].alliance_id !== undefined) {
                if (killData.attackers[attackerIndex].alliance_id === Number(process.env.FRIENDLY_ALLIANCE)) {
                    if (killerDictionary[killData.attackers[attackerIndex].character_id] === undefined) {
                        killerDictionary[killData.attackers[attackerIndex].character_id] = 1;
                    } else {
                        killerDictionary[killData.attackers[attackerIndex].character_id] += 1;
                    }
                }
            }
        }

        // We've adjusted the dictionary, now we write to file to reload in case of crash
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
    generateNewRankingMessage()
}

export async function generateNewRankingMessage() {
    // Generates a new message for us to edit. Should be called at the start of each month

    // First we forget the old list of messages
    rankingMessagesIDs = []

    // Since JS does not give any easy ways to convert from month integer to month string, 
    // we have an array to convert from one to the other
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let currentMonth = months[new Date(Date.now()).getMonth()];

    // Create an initial message for the month, then send it, and add its ID to the rankingMessagesIDs array
    rankingMessagesIDs.push((await (<TextChannel>(await client.channels.fetch(process.env.KILLER_CHANNEL))).send({
        embed: {
            title: "PvP Ranking for " + currentMonth + " " + new Date(Date.now()).getFullYear(),
            color: 0x1120f0,
        }
    })).id)

    generateRanking()
}

export async function generateRanking(forceMonth?: number) {
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

    // Update our ranking list, and add any new messages sent to the rankingMessagesIDs array
    rankingMessagesIDs = rankingMessagesIDs.concat(await updateRankingList(killerDictionary, "PvP Ranking for " + currentMonth,
        process.env.KILLER_CHANNEL, rankingMessagesIDs))

    writeScannerMessageIDs()
}

function writeKillerDictionary() {
    // Write the killerDictionary to a file to load if the server crashes
    fs.writeFileSync("data/killerDictionary.json", JSON.stringify(killerDictionary));
}

function writeScannerMessageIDs() {
    // Write the scannerDictionary to a file to load later
    fs.writeFileSync("data/killerRankingMessages.json", JSON.stringify(rankingMessagesIDs));
}

// On server load, we grab the data from before the crash
fs.readFile("data/killerDictionary.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        killerDictionary = JSON.parse(fileData)

        // Request all character IDs currently in the ranking list to generate a cache and increase the speed of retrieval
        for (let characterID in killerDictionary) {
            getCharacterName(parseInt(characterID))
        }
    }
    catch (err) {
        killerDictionary = {}
    }
})

// Read the messageIDs from file on load
fs.readFile("data/killerRankingMessages.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
    if (err) {
        console.error(err);
    }
    try {
        rankingMessagesIDs = JSON.parse(fileData)
    }
    catch (err) {
        rankingMessagesIDs = []
    }
})