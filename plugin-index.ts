import { DollarSign } from "xpresser/types";
import pluginConfig from "./plugin-config";

export function run(config: any, $: DollarSign) {
    const buildFolder = pluginConfig.data.buildFolder;
    const ServerRequestsHandler = `${buildFolder}/ServerRequestsHandler.js`;

    if (!$.file.exists(ServerRequestsHandler)) {
        $.logError(`[FrontendHelper] Note: ${ServerRequestsHandler} does not exist.`);
        $.logError(`[FrontendHelper] Create one to handle requests.`);
    }

    if (pluginConfig.get("syncFilesOnServerBooted")) {
        $.on.serverBooted(async (next) => {
            // Import ServerRequestFile generator
            const GenerateServerRequestsFile = await import(
                "./functions/GenerateServerRequestsFile"
            );

            // Generate Files
            GenerateServerRequestsFile.default($);

            // Continue with boot
            next();
        });
    }
}
