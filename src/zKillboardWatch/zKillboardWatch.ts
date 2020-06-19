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
    if (killData.solar_system_id in pathfinder.getConnectedSystems()) {
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
        thumbnail: {
            url: 'https://images.evetech.net/types/' + killData.victim.ship_type_id + '/render?size=128',
        },
        "fields": [
            {
                name: 'Attacker (final blow)',
                value: (await esijs.character.info(Number(killData.attackers[0].character_id))).name,
                inline: true
            },
            {
                name: 'Corporation',
                value: (await esijs.corporation.info(Number(killData.attackers[0].corporation_id))).name,
                inline: true
            },
            {
                name: 'Alliance',
                value: (await getAllianceInfo(killData.attackers[0].alliance_id)).name,
                inline: true
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: false
            },
            {
                name: 'Victim',
                value: (await esijs.character.info(Number(killData.victim.character_id))).name,
                inline: true
            },
            {
                name: 'Corporation',
                value: (await esijs.corporation.info(Number(killData.victim.corporation_id))).name,
                inline: true
            },
            {
                name: 'Alliance',
                value: (await getAllianceInfo(killData.victim.alliance_id)).name,
                inline: true
            },
        ],
    };
    let channel = <discord.TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
    channel.send({ embed: alertEmbed });
}

async function getAllianceInfo(allianceID: number): Promise<any> {
    if (allianceID === undefined) {
        return "None"
    } else {
        return esijs.alliance.info(allianceID)
    }
}