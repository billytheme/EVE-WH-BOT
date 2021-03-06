import { alliance } from "esijs"

// Dictionary to cache the responses. The server is in Iceland, so any caching we can do 
// will speed things up significantly
let cacheDictionary = {}

export async function getAllianceName(allianceID: number): Promise<any> {
    // Due to the possibility for a pilot to not be a part of any alliance, we assume that a
    // lack of allianceID means they are not part of one
    if (allianceID === undefined) {
        // We have declare and return a promise so we make a dummy one that resolves immediately
        return new Promise((resolve, reject) => {
            resolve('None')
        })
    } 
    // If there is an allianceID, then we need to look for the corresponding record
    else {
        // Check the cache. If there is nothing saved, then it will be undefined
        if (cacheDictionary[allianceID] !== undefined) {
            // We have declare and return a promise so we make a dummy one that resolves immediately
            return new Promise((resolve, reject) => {
                resolve(cacheDictionary[allianceID])
            })
        } 
        // No record in the cache, so load it from the server
        else {
            // We wrap the promise constructed by the retrieval function in out own one
            // This allows us to specify to return only the name
            let value = new Promise(async (resolve, reject) => {
                resolve((await alliance.info(allianceID)).name)
            })

            // Attach a function to cache the result once it loads
            value.then(function (value) {
                cacheDictionary[allianceID] = value
            })

            // Return our promise. This one will take time to return since it is an actual request
            return value
        }
    }
}