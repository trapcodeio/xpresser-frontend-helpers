import type { DollarSign } from "xpresser/types";

export = ($: DollarSign) => {
    const isDev = $.env("NODE_ENV") === "development";

    return {
        syncFilesOnServerBooted: true,

        // Folder where generated files will be saved to
        buildFolder: $.path.base("src"),

        /**
         * When enabled, the generated frontend file will validate route parameters.
         */
        strictUrlParser: isDev,

        /**
         * Skip Route if this function returns true.
         * @param name
         */
        skipRouteIf(name: string) {
            // Note this will run on every route name.
            return false;
        },

        typescript: {
            returnType: "Promise<T>",
            configType: "Record<string, any>;"
        }
    };
};
