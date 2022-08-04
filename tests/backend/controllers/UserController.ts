import { Http } from "xpresser/types/http";

/**
 * UserController
 */
export = {
    // Controller Name
    name: "UserController",

    // Controller Default Error Handler.
    e: (http: Http, error: any) => http.send({ error }),

    /**
     * Example Action.
     * @param {Http} http - Current Http Instance
     * @returns {*}
     */
    users(http: Http): Http.Response {
        return http.send({
            route: http.route
        });
    },

    create(http: Http): Http.Response {
        return http.send({
            route: http.route
        });
    },

    user(http: Http): Http.Response {
        return http.send({
            route: http.route
        });
    },

    update(http: Http): Http.Response {
        return http.send({
            route: http.route
        });
    },

    delete(http: Http): Http.Response {
        return http.send({
            route: http.route
        });
    },

    songs(http: Http): Http.Response {
        return http.send({
            route: http.route
        });
    }
};
