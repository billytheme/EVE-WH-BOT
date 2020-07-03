import { character } from "esijs"

let cacheDictionary = {}

export async function getCharacterName(characterID: number): Promise<any> {
    if (characterID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('NPC')
        })
    } else {
        if (cacheDictionary[characterID] !== undefined) {
            return new Promise((resolve, reject) => {
                resolve(cacheDictionary[characterID])
            })
        } else {
            let value = new Promise(async (resolve, reject) => {
                resolve((await character.info(characterID)).name)
            })
            value.then(function (value) {
                cacheDictionary[characterID] = value
            })
            return value
        }
    }
}