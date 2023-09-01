import { DollarSign } from "xpresser/types";
import pluginConfig from "./plugin-config";

export function run(config: any, $: DollarSign) {
    const buildFolder = pluginConfig.data.buildFolder;
    const requestHandlerFileName = pluginConfig.data.requestHandlerFileName;
    const ServerRequestsHandler = `${buildFolder}/${requestHandlerFileName}.js`;

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
            await GenerateServerRequestsFile.default($);

            // Continue with boot
            next();
        });
    }
}
