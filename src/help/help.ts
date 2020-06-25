import { client } from "../app"
import { Message, TextChannel } from "discord.js"

export function generateHelpPage() {
    const helpEmbed = {
        "title": "Command list",
        "description": "Current Prefix: `b!`\n\n\
                    `help`\n\
                    Returns this list.\n\
                    If another command is used as an argument, gives specific help for the command\n\n\
                    `scanners`\n\
                    Returns the leaderboard for best scanners this month. Gain points by jumping new wormholes and scanning signatures. Only counts if you add them to Pathfinder!\n\n\
                    `killers`\n\
                    Returns the leaderboard for the best PvP pilots this month. Gain points by killing ships!\n\n\
                    `carriers`\n\
                    performs a lookup for the best potential regions to kill carriers in",
        "color": 0x00e0bf,
    };
    let channel = <TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
    channel.send({ embed: helpEmbed })

}