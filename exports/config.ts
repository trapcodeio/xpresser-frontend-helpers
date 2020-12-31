import type {DollarSign} from "xpresser/types";

export = ($: DollarSign) => ({

    syncFilesOnServerBooted: true,

    paths: {
        serverRequestsFile: $.path.base('src/ServerRequests.js'),
        serverRequestsHandlerFile: $.path.base('src/ServerRequestsHandler.js'),
    },

    /**
     * Skip Route if this function returns true.
     * @param name
     */
    skipRouteIf(name: string) {
        // Note this will run on every route name.
        return name === "name_of_route_you_wish_to_skip";
    }
})