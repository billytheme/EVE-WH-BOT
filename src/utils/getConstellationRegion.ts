import { universe } from "esijs"

// Dictionary to cache the responses. The server is in Iceland, so any caching we can do 
// will speed things up significantly
let cacheDictionary = {}

export async function getConstellationRegion(constellationID: number): Promise<number> {
    // Check the cache. If there is nothing saved, then it will be undefined
    if (cacheDictionary[constellationID] !== undefined) {
        // We have declare and return a promise so we make a dummy one that resolves immediately
        return new Promise((resolve, reject) => {
            resolve(cacheDictionary[constellationID])
        })
    }
    // No record in the cache, so load it from the server
    else {
        // We wrap the promise constructed by the retrieval function in out own one
        // This allows us to specify to return only the name
        let value = new Promise<number>(async (resolve, reject) => {
            resolve((await universe.constellations.constellationInfo(constellationID)).region_id)
        })

        // Attach a function to cache the result once it loads
        value.then(function (value) {
            cacheDictionary[constellationID] = value
        })

        // Return our promise. This one will take time to return since it is an actual request
        return value
    }
}