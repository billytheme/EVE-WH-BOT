import { corporation } from "esijs"

let cacheDictionary = {}

export async function getCorporationName(corporationID: number): Promise<any> {
    if (corporationID === undefined) {
        return new Promise((resolve, reject) => {
            resolve('Unknown')
        })
    } else {
        if (cacheDictionary[corporationID] !== undefined) {
            return new Promise((resolve, reject) => {
                resolve(cacheDictionary[corporationID])
            })
        } else {
            let value = new Promise(async (resolve, reject) => {
                resolve((await corporation.info(corporationID)).name)
            })
            value.then(function (value) {
                cacheDictionary[corporationID] = value
            })
            return value
        }
    }
}