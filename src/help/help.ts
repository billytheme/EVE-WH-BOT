import { client } from "../app"
import { TextChannel } from "discord.js"

export function generateHelpPage() {
    // Very simple function, no dynamic parts. Just sends the static help page on command
    const helpEmbed = {
        "title": "Command list",
        "description": "Current Prefix: `b!`\n\n\
                    `help`\n\
                    Returns this list.\n\
                    If another command is used as an argument, gives specific help for the command\n\n\
                    `scanners`\n\
                    Returns the leaderboard for best scanners this month. Gain points by jumping new wormholes and scanning signatures. Only counts if you add them to Pathfinder!\nOnly the top 20 are shown by default, use \"b!scanners -all\" to show the rest\n\n\
                    `killers`\n\
                    Returns the leaderboard for the best PvP pilots this month. Gain points by killing ships!\nOnly the top 20 are shown by default, use \"b!killers -all\" to show the rest\n\n",
        "color": 0x00e0bf,
    };
    let channel = <TextChannel>client.channels.cache.get(process.env.BOT_CHANNEL);
    channel.send({ embed: helpEmbed })

}