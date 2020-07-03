import { alliance, corporation, character } from "esijs"

export async function getAllianceName(allianceID: number): Promise<any> {
    if (allianceID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('None')
        })
    } else {
        return new Promise(async (resolve, reject) => {
            resolve((await alliance.info(allianceID)).name)
        })
    }
}

export async function getCorporationName(corporationID: number): Promise<any> {
    if (corporationID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('Unknown')
        })
    } else {
        return new Promise(async (resolve, reject) => {
            resolve((await corporation.info(corporationID)).name)
        })
    }
}

export async function getCharacterName(characterID: number): Promise<any> {
    if (characterID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('NPC')
        })
    } else {
        return new Promise(async (resolve, reject) => {
            resolve((await character.info(characterID)).name)
        })
    }
}

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