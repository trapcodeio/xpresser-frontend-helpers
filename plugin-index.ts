import {DollarSign} from "xpresser/types";
import pluginConfig from "./plugin-config";

export function run(config: any, $: DollarSign) {

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