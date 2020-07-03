import { alliance } from "esijs"

let cacheDictionary = {}

export async function getAllianceName(allianceID: number): Promise<any> {
    if (allianceID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('None')
        })
    } else {
        if (cacheDictionary[allianceID] !== undefined) {
            return new Promise((resolve, reject) => {
                resolve(cacheDictionary[allianceID])
            })
        } else {
            let value = new Promise(async (resolve, reject) => {
                resolve((await alliance.info(allianceID)).name)
            })
            value.then(function (value) {
                cacheDictionary[allianceID] = value
            })
            return value
        }
    }
}