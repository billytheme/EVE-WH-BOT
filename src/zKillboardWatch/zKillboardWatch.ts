import { client } from "../app"
import * as esijs from "esijs"
import * as discord from "discord.js"
import * as pathfinder from "../pathfinderParse/pathfinderParse"
import { getAllianceName, getCharacterName, getCorporationName, isFriendlyKill } from "../utils/utils"

function isKillInChain(killData): boolean {
    // Simple function that checks whether a given killData took place within the chain
    if (pathfinder.getConnectedSystems().includes(killData.solar_system_id)) {
        return true;
    }
    return false;
}

export async function parseKill(event: { data: any; type: string; }) {
    // Takes the data returned by the WebSocket, parses the JSON and then generates 
    // an alert if the kill both was not generated by Exit, and occurred in the chain

    let killData = JSON.parse(event.data);

    if (!isFriendlyKill(killData) && isKillInChain(killData)) {
        generateAlert(killData)
    }
}

async function generateAlert(killData: any) {
    // Generates and sends an alert based on the killData provided
    const alertEmbed = {
        title: (await esijs.universe.types.typeInfo(killData.victim.ship_type_id)).name
            + " killed in "
            + (await esijs.universe.systems.systemInfo(killData.solar_system_id)).name
            + " - "
            + pathfinder.getJumpsFromHome(killData.solar_system_id)
            + " Jumps from Deep",
        color: 0xff0000,
        url: killData.zkb.url,
        thumbnail: {
            url: 'https://images.evetech.net/types/'
                + killData.victim.ship_type_id
                + '/render?size=128',
        },
        "fields": [
            {
                name: 'Attacker (final blow)',
                value: await getCharacterName(killData.attackers[0].character_id),
                inline: true
            },
            {
                name: 'Corporation',
                value: await getCorporationName(killData.attackers[0].corporation_id),
                inline: true
            },
            {
                name: 'Alliance',
                value: await getAllianceName(killData.attackers[0].alliance_id),
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: false
            },
            {
                name: 'Victim',
                value: await getCharacterName(killData.victim.character_id),
                inline: true
            },
            {
                name: 'Corporation',
                value: await getCorporationName(killData.victim.corporation_id),
                inline: true
            },
            {
                name: 'Alliance',
                value: await getAllianceName(killData.victim.alliance_id),
                inline: true
            },
        ],
    };
    let channel = <discord.TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
    channel.send({ embed: alertEmbed });
}