import {DollarSign} from "xpresser/types";
import pluginConfig from "./plugin-config";

export function run(config: any, $: DollarSign) {
    const buildFolder = pluginConfig.data.buildFolder;
    const ServerRequestsHandler = `${buildFolder}/ServerRequestsHandler.js`;

    if(!$.file.exists(ServerRequestsHandler)) {
        $.logError(`[FrontendHelper] Note: ${ServerRequestsHandler} does not exist.`);
        $.logError(`[FrontendHelper] Create one to handle requests.`);
    }

    if (pluginConfig.get('syncFilesOnServerBooted')) {
        $.on.serverBooted(next => {
            // Continue with boot
            next();

            // Import ServerRequestFile generator
            const GenerateServerRequestsFile = require("./functions/GenerateServerRequestsFile");

            // Generate Files
            GenerateServerRequestsFile($);
        });
    }

}