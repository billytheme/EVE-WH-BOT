"use strict";
import * as discord from "discord.js";
import * as dotenv from "dotenv";

//Generic command to initialise the dotenv library
dotenv.config();

//Initialise the client
export let client: discord.Client = new discord.Client();

// We import events and commands strictly for side effects
// Events sets up the functions to maintain our database based on external inputs (Pathfinder, zKill)
// Commands sets up the functions to display info to the users
import "./events"
import "./commands"

//Connect the application to discord
client.login(process.env.CLIENT_SECRET_KEY);