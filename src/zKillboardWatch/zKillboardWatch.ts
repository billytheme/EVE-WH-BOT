import { client } from "../app"
import * as esijs from "esijs"
import * as discord from "discord.js"
import * as pathfinder from "../pathfinderParse/pathfinderParse"

function isFriendlyKill(killData): boolean {
    let containsFriendlyAttacker = false;
    (killData.attackers).forEach(attacker => {
        if (attacker.alliance_id === Number(process.env.FRIENDLY_ALLIANCE)) {
            containsFriendlyAttacker = true;
        }
    });

    if (killData.victim.alliance_id === Number(process.env.FRIENDLY_ALLIANCE) || containsFriendlyAttacker) {
        return true;
    }
    else {
        return false;
    }
}

function isKillInChain(killData): boolean {
    if (pathfinder.getConnectedSystems().includes(killData.solar_system_id)) {
        return true;
    }
    return false;
}

export async function parseKill(event: { data: any; type: string; }) {
    let killData = JSON.parse(event.data);

    if (!isFriendlyKill(killData) && isKillInChain(killData)) {
        generateAlert(killData)
    }
}

async function generateAlert(killData: any) {
    const alertEmbed = {
        title: (await esijs.universe.types.typeInfo(killData.victim.ship_type_id)).name
            + " killed in " + (await esijs.universe.systems.systemInfo(killData.solar_system_id)).name
            + " - " + pathfinder.getJumpsFromHome(killData.solar_system_id)
            + " Jumps from Deep",
        color: 0xff0000,
        url: killData.zkb.url,
        thumbnail: {
            url: 'https://images.evetech.net/types/' + killData.victim.ship_type_id + '/render?size=128',
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

async function getAllianceName(allianceID: number): Promise<any> {
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

async function getCorporationName(corporationID: number): Promise<any> {
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

async function getCharacterName(characterID: number): Promise<any> {
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