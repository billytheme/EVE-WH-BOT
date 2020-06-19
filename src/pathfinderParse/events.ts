import * as pathfinder from "./pathfinderParse"
import { client } from "../app"

//When we receive a message, pass it to the parse function
client.on('message', pathfinder.parseMessage)

//Once we load, load any messages we missed while offline and parse them into memory
client.on('ready', pathfinder.catchupOnUpdates);