import type {DollarSign} from "xpresser/types";
import os = require("os");
import {RouteData} from "@xpresser/router/src/custom-types"
// @ts-ignore
const {js: beautify} = require('js-beautify');

type ProcessedRouteData = RouteData & {url: string};
export = ($: DollarSign) => {

    let JsContent: string[] = [
        `import handleRequest from './ServerRoutesHandler';`,
        ``,
        `export default {`
    ];

    // ProcessRoutes.
    const routes = $.routerEngine.allProcessedRoutes() as ProcessedRouteData[];

    const Controllers = $.objectCollection();
    for (const route of routes) {
        const {name} = route;
        if (typeof name === "string") {
            let fControllerPath = `${route.method}.${name}`
            Controllers.set(fControllerPath, () => ({...route}));
        }
    }

    const ControllersPath = $.path.base('src/ServerRequests.js')


    for (const method of Controllers.keys()) {
        const methodRoutes = Controllers.get(method);

        /* Start Method Object Template */
        jsLine(`${method}: {`) // method: {

        // console.log(methodRoutes)
        loopAllKeysOfMethod(methodRoutes);

        /* End Method Object Template */
        jsLine(`},`) // };
    }

    JsContent.push('};')
    let content = JsContent.join(os.EOL);
    content = beautify(content, {indent_size: 2, space_in_empty_paren: true});

    $.file.fs().writeFileSync(
        ControllersPath,
        content
    );
    $.logCalmly("FControllers Synced Successfully.");


    function jsLine(line: string) {
        JsContent.push(line);
    }

    function jsLines(lines: string[]) {
        JsContent = JsContent.concat(lines);
    }


    function loopAllKeysOfMethod(routes: Record<string, any> = {}) {
        for (const name of Object.keys(routes)) {
            const route = routes[name];
            if (typeof route === "function") {
                const thisRoute = route() as ProcessedRouteData;
                jsRouterNameFunction(name, thisRoute);
            } else {

                jsLine(`${name}: {`);
                loopAllKeysOfMethod(route)
                jsLine(`},`)
            }
        }
    }

    function jsRouterNameFunction(shortName: string, route: ProcessedRouteData) {
        const path = route.url;
        const commentLines = `
        /**
         * ${route.controller}
         * @example
         * {name: '${route.name}', path: '${route.path}'}
         */
        `.trim();

        jsLines([
            commentLines,
            `${shortName}: (...args) => handleRequest({`,
            `method: '${route.method}',`,
            `path: '${path}',`,
            `}, args),`,
        ])
    }
}
