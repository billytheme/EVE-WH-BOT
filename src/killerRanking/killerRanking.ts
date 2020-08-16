import { isfriendlyAttackers } from "../utils/utils"
import * as fs from "fs"
import { sendRankingList, getCharacterName } from "../utils/utils"

let killerDictionary: Record<number, number> = {};

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
    generateRanking(new Date(Date.now()).getMonth() - 1, true);
    killerDictionary = {}
    writeKillerDictionary();
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

    sendRankingList(killerDictionary, fullList, "PvP ranking for " + currentMonth)
}

function writeKillerDictionary() {
    // Write the scannerDictionary to a file to load if the server crashes
    fs.writeFileSync("data/killerDictionary.json", JSON.stringify(killerDictionary));
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