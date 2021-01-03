import type {DollarSign} from "xpresser/types";
import {RouteData} from "@xpresser/router/src/custom-types"
import {getRouteParams, paramsToTsType} from "./Utils";
import os = require("os");
import pretty = require("prettier");
import PluginConfig from "../plugin-config";


// @ts-ignore
const {js: beautify} = require('js-beautify');

type ProcessedRouteData = RouteData & { url: string };
export = ($: DollarSign) => {
    const pluginConfig: {
        syncFilesOnServerBooted: boolean,
        buildFolder: string,
        strictUrlParser: boolean,
        skipRouteIf(name: string): boolean,
        namespace: string
    } = PluginConfig.all();

    let pluginPath = '@trapcode/xpresser-frontend-helpers';


    let JsContent: string[] = [
        `/*
        * This is an auto-generated file.
        * ----- DO NOT MODIFY -----
        * */`,
        `import s from './ServerRoutesHandler';`,
        `import {${pluginConfig.strictUrlParser ? 'parseUrlStrict' : 'parseUrl'} as p} from '${pluginPath}';`,
        ``,
        `export default {`
    ];

    let TsContent: string[] = [
        `/*
        * This is an auto-generated file.
        * ----- DO NOT MODIFY -----
        * */`,
        '',
        `export type StringOrNumber = string | number;`,
        `export type SRBody = Record<StringOrNumber, any>;`,
        `export type SRQuery = Record<StringOrNumber, StringOrNumber>;`,
        `export type SRParams = StringOrNumber | StringOrNumber[];`,
        `export type SRConfig = Partial<{query: SRQuery, body: SRBody}> & Record<string, any>;`,
        '',
        'declare const _default: {'
    ];

    // ProcessRoutes.
    const routes = $.routerEngine.allProcessedRoutes() as ProcessedRouteData[];

    const Controllers = $.objectCollection();
    for (const route of routes) {
        const {name} = route;
        if (typeof name === "string" && !pluginConfig.skipRouteIf(name)) {
            let fControllerPath = `${route.method}.${name}`
            Controllers.set(fControllerPath, () => ({...route}));
        }
    }

    const folder = pluginConfig.buildFolder;
    if (!$.file.isDirectory(folder)) {
        return $.logError('FrontendHelper: config {buildFolder} does not exist.')
    }

    const ServerRequestsFilePath = `${folder}/ServerRequests.js`;
    const TsServerRequestsFilePath = `${folder}/ServerRequests.d.ts`;

    for (const method of Controllers.keys()) {
        const methodRoutes = Controllers.get(method);

        /* Start Method Object Template */
        jsLine(`${method}: {`) // method: {
        tsLine(`${method}: {`)

        // console.log(methodRoutes)
        loopAllKeysOfMethod(methodRoutes);

        /* End Method Object Template */
        jsLine(`},`) // };
        tsLine(`},`) // };
    }

    JsContent.push('};');
    TsContent.push('};')
    TsContent.push('export default _default;')

    let content = JsContent.join(os.EOL);
    let tsContent = TsContent.join(os.EOL);

    content = beautify(content, {indent_size: 2, space_in_empty_paren: true});
    tsContent = pretty.format(tsContent, {
        semi: true,
        parser: "typescript",
        bracketSpacing: true,
        tabWidth: 4
    });

    $.file.fs().writeFileSync(TsServerRequestsFilePath, tsContent);
    $.file.fs().writeFileSync(ServerRequestsFilePath, content);

    $.logCalmly("ServerRequests file synced successfully.");


    function jsLine(line: string) {
        JsContent.push(line);
    }

    function tsLine(line: string) {
        TsContent.push(line);
    }

    function jsLines(lines: string[]) {
        JsContent = JsContent.concat(lines);
    }

    function tsLines(lines: string[]) {
        TsContent = TsContent.concat(lines);
    }


    function loopAllKeysOfMethod(routes: Record<string, any> = {}) {
        for (const name of Object.keys(routes)) {
            const route = routes[name];
            if (typeof route === "function") {
                const thisRoute = route() as ProcessedRouteData;
                setRouterNameFunction(name, thisRoute);
            } else {

                jsLine(`${name}: {`);
                tsLine(`${name}: {`);

                loopAllKeysOfMethod(route)

                jsLine(`},`)
                tsLine(`},`)
            }
        }
    }

    function setRouterNameFunction(shortName: string, route: ProcessedRouteData) {
        if (route && route.method) {
            const routeParams = getRouteParams(route.path as string)
            const routeParamsKeys = Object.keys(routeParams);
            const commentLines = `
            /**
             * **${route.controller}**
             * 
             * - \`[${route.name}]\`
             * - \`${route.method.toUpperCase()}: ${route.path}\`
             */
            `.trim();

            jsLines([
                // '',
                // commentLines,
                `${shortName}: (...args) => s(...p([`,
                `'${route.method}', '${route.path}',`,
                `${JSON.stringify(routeParams).split('"').join("")},`,
                `], args)),`,
            ]);


            /**
             * Typescript Lines.
             */

            let argumentsType!: string;

            // check for route params
            if (routeParamsKeys.length) {
                argumentsType = `params: {${paramsToTsType(routeParams)}} | SRParams`
            }

            if (['post', 'put', 'patch'].includes(route.method.toLowerCase())) {
                if (argumentsType) {
                    argumentsType += `, body?: SRBody`
                } else {
                    argumentsType = `body?: SRBody`
                }
            } else {
                if (argumentsType) {
                    argumentsType += `, query?: SRQuery`
                } else {
                    argumentsType = `query?: SRQuery`
                }
            }

            argumentsType += `, config?: SRConfig, ...others: any[]`;

            let defaultTsType = `${shortName}<T=any>(${argumentsType}): T;`

            tsLines([
                '',
                commentLines,
                defaultTsType
            ])
        }

    }
}
