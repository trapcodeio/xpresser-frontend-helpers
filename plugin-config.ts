import { namespace } from "./use.json";
import defaultConfig from "./exports/config";
import { loadPluginConfig } from "@xpresser/plugin-tools/src/Config";
import type { RouteData } from "@xpresser/router/src/custom-types";

export type ProcessedRouteData = RouteData & { url: string };
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

    /**
     * Typescript config
     */
    typescript: {
        returnType: string | ((route: ProcessedRouteData) => string);
    };
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
