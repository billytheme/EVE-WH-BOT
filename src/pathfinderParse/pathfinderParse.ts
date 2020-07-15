import * as fs from "fs";
import * as esijs from "esijs"
import { MessageEmbed, Message, TextChannel } from "discord.js"
import { client } from "../app"

// Create storage for the various databases.
// wormholeDictionary stores connections between wormholes
// systemDictionary maps internal pathfinder ID to the EvE system ID
let wormholeDictionary: Record<number, { wormhole: Record<'source' | 'target', number>, created: number }> = {};
let systemDictionary: Record<number, number> = {};

function writeWormholeDictionary() {
    // Writes wormhole dictionary to file for later retrieval. While async would be better, 
    // sometimes many functions could write at once, leading to errors in the file.
    fs.writeFileSync("data/wormholeDictionary.json", JSON.stringify(wormholeDictionary));
}

function writeSystemDictionary() {
    // Writes system dictionary to file for later retrieval. While async would be better, 
    // sometimes many functions could write at once, leading to errors in the file.
    fs.writeFileSync("data/systemDictionary.json", JSON.stringify(systemDictionary));
}

function writeLastParsedMessage(messageID: string) {
    // Writes last parsed update message to file for later retrieval. While async would be better, 
    // sometimes many functions could write at once, leading to errors in the file.
    // By writing this to file, it allows us to recover lost data if the program crashes
    fs.writeFileSync('data/lastParsedMessage.txt', messageID)
}

function readLastParsedMessage(): string {
    // These files are not synced through git, so on new installs they may not exist.
    // Therefore, if we get an error, they don't exist, so return an empty result
    try {
        let lastParsedMessage: string = fs.readFileSync('data/lastParsedMessage.txt', { encoding: 'utf-8', flag: 'r' });
        return lastParsedMessage;
    }
    catch (err) {
        return "";
    }
}

export function parseMessage(message: Message) {
    // check if the message is from the updates channel. If it is, check that it has at least
    // one embed, and if so, loop through and process them
    if (message.embeds.length !== 0 && message.channel.id === process.env.UPDATES_CHANNEL) {
        message.embeds.forEach(element => {
            parseUpdate(element);
            writeLastParsedMessage(message.id);
        });
    }
}

async function parseUpdate(embed: MessageEmbed) {
    // Takes a MessageEmbed and updates the dictionary based on received information

    // Switch for the three types of message: Created, Updated, or Deleted
    // Both created and updated will give new info to store. JS allows us to treat them the same
    switch (embed.title.split(' ')[0]) {
        case "Created":
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    const wormholeDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    if (wormholeDictionary[wormholeDatabaseID] === undefined) {
                        wormholeDictionary[wormholeDatabaseID] = {wormhole: undefined, created: undefined}
                        wormholeDictionary[wormholeDatabaseID].wormhole = { 'source': undefined, 'target': undefined }
                    }

                    wormholeDictionary[wormholeDatabaseID].created = Date.now();
                    break;
            }
        case "Updated":
            // Switch for either:
            //   connection: Create a new ID (for identification when deleting), and source and target system
            //   system: Create new ID (for identification when deleting), and EvE system ID
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    const wormholeDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    //Initialise the record if not already existing
                    if (wormholeDictionary[wormholeDatabaseID] === undefined) {
                        wormholeDictionary[wormholeDatabaseID] = {wormhole: undefined, created: undefined}
                        wormholeDictionary[wormholeDatabaseID].wormhole = { 'source': undefined, 'target': undefined }
                    }
                    //Loop through the information provided and store it
                    //we only care about the source and target here
                    embed.description.replace(/`/g, '').split(',').forEach(element => {
                        switch (element.slice(0, element.lastIndexOf(':')).trim()) {
                            case "source":
                                let source = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID].wormhole.source = Number(source);
                                break;
                            case "target":
                                let target = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID].wormhole.target = Number(target);
                                break;
                        }
                    });

                    writeWormholeDictionary();
                    break;
                case "system":
                    //Grab the system database ID and name from the message, then translate the name to an eve ID
                    //We don't need to worry about the contents of the description, as we only care about the 
                    //database ID to eve ID mapping
                    const systemDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    const systemName = embed.title.slice(embed.title.indexOf("'") + 1, embed.title.lastIndexOf("'"))
                    let solarSystemID = await esijs.search.search(systemName, 'solar_system', true)
                    systemDictionary[systemDatabaseID] = solarSystemID.solar_system[0];
                    writeSystemDictionary();
                    break;
            }
            break;
        case "Deleted":
            //When we delete, we only want to parse the Database ID so we can delete the entry
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    //Parse the wormhole ID and delete it from memory
                    const wormholeDatabaseID = Number(embed.title.slice(embed.title.indexOf('#') + 1).trim());
                    delete wormholeDictionary[wormholeDatabaseID];
                    writeWormholeDictionary();
                    break;
                case "system":
                    //Parse the system Database ID and delete it from memory
                    const systemDatabaseID = Number(embed.title.slice(embed.title.indexOf('#') + 1).trim());
                    delete systemDictionary[systemDatabaseID.toString()];
                    writeSystemDictionary();
                    break;
            }
            break;
    }
}

function checkWormholeTimeout() {
    // Bandaid solution. Sometimes Pathfinder will just not send the deletion method, so we add
    // a timeout of 1.5 days to all connections just in case
    for (const wormholeDatabaseID in wormholeDictionary){
        let timeSinceCreated = Date.now() - wormholeDictionary[wormholeDatabaseID].created;
        // 129600000 is the number of seconds in 1.5 days
        if (timeSinceCreated > 129600000){
            delete wormholeDictionary[wormholeDatabaseID];
        }
    }
}

export function getConnectedSystems(): Array<number> {
    // The Pathfinder API is sometimes unreliable and will not push certain deletion events,
    // so we check them all manually for timeout before processing
    checkWormholeTimeout()
    // Returns an array of the EvE system IDs of all systems connected to the home system
    let connectedSystems = [Number(process.env.HOME_SYSTEM)];

    // Since the connections are not sorted, we loop through them all repeatedly until we don't find
    // another connected system
    let foundNewConnections: boolean;

    // do while loop, since we can't have found any connections last round on the first round
    do {
        foundNewConnections = false;
        for (const wormhole in wormholeDictionary) {
            // Check if one of the end points of the connection is in our graph, 
            // then add the other one. If neither is in the graph, then its not connected. 
            // If both are, then we already have both systems and don't need to add them
            if (connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.source]) &&
                !connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.target])) {
                connectedSystems.push(systemDictionary[wormholeDictionary[wormhole].wormhole.target]);
                foundNewConnections = true;
            }
            if (!connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.source]) &&
                connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.target])) {
                connectedSystems.push(systemDictionary[wormholeDictionary[wormhole].wormhole.source]);
                foundNewConnections = true;
            }
        };
    } while (foundNewConnections);

    return connectedSystems;
}

export function getJumpsFromHome(system: number) {
    // The Pathfinder API is sometimes unreliable and will not push certain deletion events,
    // so we check them all manually for timeout before processing
    checkWormholeTimeout()
    // A modified getConnectedSystems which find the distance of the specified system from
    // the home system. Takes an EVE system ID
    let connectedSystems = [Number(process.env.HOME_SYSTEM)];
    let jumpsFromHome = 0;

    // Check the target is connected before running. If it's not, the function will loop forever
    if (getConnectedSystems().includes(system)) {
        while (!connectedSystems.includes(system)) {
            // We need to ensure we proceed outwards one layer at a time, so rather than putting
            // found systems directly into the connectedSystems array, we 
            let foundThisIteration: Array<number> = []

            // Since we haven't found the target yet, increment the distance counter
            jumpsFromHome += 1;

            for (const wormhole in wormholeDictionary) {
                // Check if one of the end points of the connection is in our graph, 
                // then add the other one. If neither is in the graph, then its not connected. 
                // If both are, then we already have both systems and don't need to add them
                if (connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.source]) &&
                    !connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.target])) {
                    foundThisIteration.push(systemDictionary[wormholeDictionary[wormhole].wormhole.target]);
                }
                if (!connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.source]) &&
                    connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].wormhole.target])) {
                    foundThisIteration.push(systemDictionary[wormholeDictionary[wormhole].wormhole.source]);
                }
            };

            // We've found all the systems in this iteration, add them to the main list
            connectedSystems = connectedSystems.concat(foundThisIteration)
        }

        return jumpsFromHome;
    }
    // If the system was not connected, just return null
    else {
        return null;
    }
}

export function catchupOnUpdates() {
    // Intended to be called on startup. We check the last parsed message, and if it 
    // exists (ie. this is not a new installation), we read and parse all messages since then.
    let lastParsedMessage = readLastParsedMessage();
    if (lastParsedMessage !== undefined && lastParsedMessage !== '') {
        let channel = <TextChannel>client.channels.cache.get(process.env.UPDATES_CHANNEL);
        channel.messages.fetch({ after: readLastParsedMessage() }).then(function (messages) {
            messages.array().reverse().forEach(message => {
                parseMessage(message);
            });
        })
    }
}

//Read and parse wormhole dictionary
fs.readFile("data/wormholeDictionary.json", { encoding: 'utf-8', flag: 'r+' },
    function (err, fileData) {
        // These files are not synced through git, so on new installs they may not exist.
        // Therefore, if we get an error, they don't exist, so return an empty result
        if (err) {
            console.error(err);
        }
        try {
            wormholeDictionary = JSON.parse(fileData);
        }
        catch (err) {
            wormholeDictionary = {}
        }
    })

//Read and parse system dictionary
fs.readFile("data/systemDictionary.json", { encoding: 'utf-8', flag: 'r+' },
    function (err, fileData) {
        // These files are not synced through git, so on new installs they may not exist.
        // Therefore, if we get an error, they don't exist, so return an empty result
        if (err) {
            console.error(err);
        }
        try {
            systemDictionary = JSON.parse(fileData)
        }
        catch (err) {
            wormholeDictionary = {}
        }
        systemDictionary[process.env.HOME_SYSTEM_DATABASE_ID] = Number(process.env.HOME_SYSTEM);
    })

