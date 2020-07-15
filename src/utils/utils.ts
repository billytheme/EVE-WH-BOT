import { getAllianceName } from "./getAllianceName"
import { getCharacterName } from "./getCharacterName"
import { getCorporationName } from "./getCorporationName"

// Attach the other functions from other file to the exports of this one
export { getAllianceName, getCharacterName, getCorporationName }

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