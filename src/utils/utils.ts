import * as esijs from "esijs"

export async function getAllianceName(allianceID: number): Promise<any> {
    if (allianceID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('None')
        })
    } else {
        return new Promise(async (resolve, reject) => {
            resolve((await esijs.alliance.info(allianceID)).name)
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
            resolve((await esijs.corporation.info(corporationID)).name)
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
            resolve((await esijs.character.info(characterID)).name)
        })
    }
}