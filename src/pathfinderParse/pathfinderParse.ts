import * as fs from "fs";
import * as esijs from "esijs"
import { MessageEmbed, Message, TextChannel } from "discord.js"
import { client } from "../app"

//Create storage for the various databases
let wormholeDictionary: Record<number, Record<'source' | 'target', number>> = {};
let systemDictionary: Record<number, number> = {};

function writeWormholeDictionary() {
    fs.writeFileSync("data/wormholeDictionary.json", JSON.stringify(wormholeDictionary));
}

function writeSystemDictionary() {
    fs.writeFileSync("data/systemDictionary.json", JSON.stringify(systemDictionary));
}

function writeLastParsedMessage(messageID: string) {
    fs.writeFileSync('data/lastParsedMessage.txt', messageID)
}

function readLastParsedMessage(): string {
    try {
        let lastParsedMessage: string = fs.readFileSync('data/lastParsedMessage.txt', { encoding: 'utf-8', flag: 'r' });
        return lastParsedMessage;
    }
    catch (err) {
        return "";
    }
}

export function parseMessage(message: Message) {
    if (message.embeds.length !== 0 && message.channel.id === process.env.UPDATES_CHANNEL) {
        message.embeds.forEach(element => {
            //Rudimentary check that the embed came from the Pathfinder API. Needs to be improved
            if (element.footer.text === "Pathfinder API") {
                parseUpdate(element);
                writeLastParsedMessage(message.id);
            }
        });
    }
}

function parseUpdate(embed: MessageEmbed) {
    //Switch for the three types of message: Created, Updated, or Deleted
    //Both created and updated will give new info to store. JS allows us to treat them the same
    switch (embed.title.split(' ')[0]) {
        case "Created":
        case "Updated":
            //Switch for either:
            //  connection: Create a new ID (for identification when deleting), and source and target system
            //  system: Create new ID (for identification when deleting), and EvE system ID
            switch (embed.title.split(' ')[1]) {
                case "connection":
                    const wormholeDatabaseID = Number(embed.title.split(' ')[3].replace('#', ''));
                    //Initialise the record if not already existing
                    if (wormholeDictionary[wormholeDatabaseID] === undefined) {
                        wormholeDictionary[wormholeDatabaseID] = { 'source': undefined, 'target': undefined }
                    }
                    //Loop through the information provided and store it
                    //we only care about the source and target here
                    embed.description.replace(/`/g, '').split(',').forEach(element => {
                        switch (element.slice(0, element.lastIndexOf(':')).trim()) {
                            case "source":
                                let source = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID].source = Number(source);
                                break;
                            case "target":
                                let target = element.slice(element.lastIndexOf('➜') + 1).trim();
                                wormholeDictionary[wormholeDatabaseID].target = Number(target);
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
                    esijs.search.search(systemName, 'solar_system', true).then((solarSystemID) => {
                        systemDictionary[systemDatabaseID] = solarSystemID.solar_system[0];
                        writeSystemDictionary();
                    });
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

export function getConnectedSystems(): Array<number> {
    let connectedSystems = [Number(process.env.HOME_SYSTEM)];

    let foundNewConnections: boolean;
    do {
        foundNewConnections = false;
        for (const wormhole in wormholeDictionary) {
            if (connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].source]) &&
                !connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].target])) {
                connectedSystems.push(systemDictionary[wormholeDictionary[wormhole].target]);
                foundNewConnections = true;
            }
            if (!connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].source]) &&
                connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].target])) {
                connectedSystems.push(systemDictionary[wormholeDictionary[wormhole].source]);
                foundNewConnections = true;
            }
        };
    } while (foundNewConnections);

    return connectedSystems;
}

export function getJumpsFromHome(system: number) {
    let connectedSystems = [Number(process.env.HOME_SYSTEM)];
    let jumpsFromHome = 0;

    if (getConnectedSystems().includes(system)) {
        while (!connectedSystems.includes(system)) {
            let foundThisIteration: Array<number> = []
            jumpsFromHome += 1;

            for (const wormhole in wormholeDictionary) {
                if (connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].source]) &&
                    !connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].target])) {
                    foundThisIteration.push(systemDictionary[wormholeDictionary[wormhole].target]);
                }
                if (!connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].source]) &&
                    connectedSystems.includes(systemDictionary[wormholeDictionary[wormhole].target])) {
                    foundThisIteration.push(systemDictionary[wormholeDictionary[wormhole].source]);
                }
            };
            connectedSystems = connectedSystems.concat(foundThisIteration)
        }

        return jumpsFromHome;
    }
    else {
        return null;
    }
}

export function getSystemDatabaseIDFromSystemID(systemID: number): number {
    for (const systemDatabaseID in systemDictionary) {
        if (systemDictionary[Number(systemDatabaseID)] === systemID) {
            return Number(systemDatabaseID);
        }
    };
    return null;
}

export function catchupOnUpdates() {
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
fs.readFile("data/wormholeDictionary.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
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
fs.readFile("data/systemDictionary.json", { encoding: 'utf-8', flag: 'r+' }, function (err, fileData) {
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

