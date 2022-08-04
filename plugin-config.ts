import { namespace } from "./use.json";
import defaultConfig from "./exports/config";
import { loadPluginConfig } from "@xpresser/plugin-tools/src/Config";

export type FrontendHelperConfig = {
    namespace: string;

    syncFilesOnServerBooted: boolean;

    // Folder where generated files will be saved to
    buildFolder: string;

    /**
     * When enabled, the generated frontend file will validate route parameters.
     */
    strictUrlParser: boolean;

    /**
     * Skip Route if this function returns true.
     * @param name
     */
    skipRouteIf(name: string): boolean;
};

/**
 * Get plugin config.
 */
const { pluginConfig } = loadPluginConfig({
    namespace,
    configFile: "frontend-helpers",
    type: "function",
    default: defaultConfig
});

export default pluginConfig;
