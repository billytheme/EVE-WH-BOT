import { getAllianceName } from "./getAllianceName"
import { getCharacterName } from "./getCharacterName"
import { getCorporationName } from "./getCorporationName"
import { client } from "../app"
import { Snowflake, TextChannel } from "discord.js"
import { getSystemRegion } from "./getSystemRegion"

// Attach the other functions from other file to the exports of this one
export { getAllianceName, getCharacterName, getCorporationName, getSystemRegion }

export function isFriendlyKill(killData): boolean {
    // A friendly kill is one where either the defender or any of the attackers are friendly

    // This could be rewritten without the if statements, but in the interest of readability 
    // it is kept in this form
    if (isfriendlyVictim(killData) || isfriendlyAttackers(killData)) {
        return true;
    }
    else {
        return false;
    }
}

export function isfriendlyAttackers(killData): boolean {
    // First, we loop through all the attackers and check whether any of them are friendly to 
    // generate a boolean representing if the any of the attackers are friendly 
    let containsFriendlyAttacker = false;
    (killData.attackers).forEach(attacker => {
        if (attacker.alliance_id === Number(process.env.FRIENDLY_ALLIANCE)) {
            containsFriendlyAttacker = true;
        }
    });
    return containsFriendlyAttacker;
}

export function isfriendlyVictim(killData): boolean {
    // Check if the victim was part of out friendly alliance
    return killData.victim.alliance_id === Number(process.env.FRIENDLY_ALLIANCE)
}

export function isWormholeKill(killData): boolean {
    return killData.solar_system_id > 31000000 && killData.solar_system_id < 32000000
}

export function isWormholeRegion(regionID: number): boolean {
    // Wormhole Region IDs occur between 11000000 and 12000000
    if (regionID > 11000000 && regionID < 12000000) {
        return true
    }
    else {
        return false
    }
}

export async function updateRankingList(rankingList: Record<number, number>, mainTitle: string,
    channelID: Snowflake, rankingMessagesIDs: Array<Snowflake>): Promise<Array<Snowflake>> {

    // Create a list of character IDs in the dictionary
    let sortedList: Array<number> = [];
    for (const characterID in rankingList) {
        sortedList.push(Number(characterID))
    }
    // Sort the list based on their score
    sortedList.sort(function (lowerCompare, upperCompare): number {
        return rankingList[upperCompare] - rankingList[lowerCompare];
    })

    // Declare the variables for us to initialise soon
    // Since we have a maximum length for descriptions, we have to seperate them into seperate
    // updates if they get too long
    let rankingStrings: Array<string> = [''];
    let rankingStringIndex = 0;
    let currentRanking = 1;

    //Create the list entries. Repeat the number of times specified above
    for (let index = 0; index < sortedList.length; index++) {
        let newEntry = currentRanking + ': ' + (await getCharacterName(sortedList[index])) + ' - ' + rankingList[sortedList[index]] + ' points\n'

        // If the length would surpass the maximum length, make a new string
        if ((rankingStrings[rankingStringIndex] + newEntry).length > 2048) {
            rankingStringIndex += 1;
            rankingStrings[rankingStringIndex] = ''
        }

        // Add the new entry to the string
        rankingStrings[rankingStringIndex] += newEntry;
        currentRanking += 1;
    }

    // List of new messages used
    let newMessages: Array<Snowflake> = []

    // Generate the embed objects
    for (let i = 0; i < rankingStrings.length; i++) {
        let title: string
        if (rankingStrings.indexOf(rankingStrings[i]) === 0) {
            title = mainTitle
        }
        else {
            title = ""
        }
        // Generate the embed object
        let listEmbed = {
            title: title,
            color: 0x1120f0,
            description: rankingStrings[i]
        }

        if (rankingMessagesIDs[i] !== undefined) {
            // Update the message with the embed object
            let message = await (<TextChannel>(await client.channels.fetch(channelID))).messages.fetch(rankingMessagesIDs[i]);
            message.edit({ embed: listEmbed })
        }
        else {
            // Not enough messages, need to send another, and save the snowflake
            let channel = <TextChannel>(await client.channels.fetch(channelID))
            newMessages.push((await channel.send({ embed: listEmbed })).id)
        }
    }

    //Return the new messages that were created
    return newMessages
}