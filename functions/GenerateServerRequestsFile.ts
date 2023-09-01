import os from "os";
import pretty from "prettier";
import { js as beautify } from "js-beautify";
import type { DollarSign } from "xpresser/types";
import { getRouteParams, paramsToTsType } from "./Utils";
import PluginConfig, { FrontendHelperConfig, ProcessedRouteData } from "../plugin-config";
import { execSync } from "child_process";

// type ProcessedRouteData = RouteData & { url: string };
export = async ($: DollarSign) => {
    const pluginConfig: FrontendHelperConfig & { namespace: string } = PluginConfig.all();
    const ts = pluginConfig.typescript;

    const folder = pluginConfig.buildFolder;
    if (!$.file.isDirectory(folder)) {
        return $.logError("FrontendHelper: config {buildFolder} does not exist.");
    }

    // let pluginPath = '../../index';
    let pluginPath = "@trapcode/xpresser-frontend-helpers";

    let JsContent: string[] = [
        `/*
        * This is an auto-generated file.
        * ----- DO NOT MODIFY -----
        * */`,
        `import s from './${pluginConfig.requestHandlerFileName}';`,
        `import {internalRouteParser as r, ${
            pluginConfig.strictUrlParser ? "parseUrlStrict" : "parseUrl"
        } as p} from '${pluginPath}';`,
        ``
    ];

    let TsContent: string[] = [
        `/*
        * This is an auto-generated file.
        * ----- DO NOT MODIFY -----
        * */`,
        "",
        `export type StringOrNumber = string | number;`,
        `export type SRBody = Record<StringOrNumber, any>;`,
        `export type SRQuery = Record<StringOrNumber, any>;`,
        `export type SRParams = StringOrNumber | StringOrNumber[];`,
        `export type SRConfig = ${ts.configType};`,
        "",
        `/**
         * Parse name to path.
         */`,
        `export declare function route(name: string, params?: SRParams, query?: SRQuery): string;`,
        "",
        `/**
         * Parse name to path with validation.
         */`,
        `export declare function routeStrict(name: string, params?: SRParams, query?: SRQuery): string;`,
        "",
        "declare const _default: {"
    ];

    // ProcessRoutes.
    const routes = $.routerEngine.allProcessedRoutes() as ProcessedRouteData[];

    const Controllers = $.objectCollection();
    jsLine(`const a = [`);

    for (const route of routes) {
        const { name } = route;
        if (typeof name === "string" && !pluginConfig.skipRouteIf(name)) {
            const routeParams = getRouteParams(route.path as string);
            let fControllerPath = `${route.method}.${name}`;

            Controllers.set(fControllerPath, () => ({ ...route }));

            jsLine(
                `['${route.method}', '${route.name}', '${route.path}', ${JSON.stringify(routeParams)
                    .split('"')
                    .join("")}],`
            );
        }
    }
    jsLines([`];`, ""]);

    jsLines([
        "// Autogenerate useful objects",
        "const b = {}, c = {};\n" +
            "for (const d of a) {\n" +
            "  // name => [url, params]\n" +
            "  c[d[1]] = [d[2], d[3]];\n" +
            "  // method.name => [url, params]\n" +
            "  c[`${d[0]}.${d[1]}`] = [d[2], d[3]];\n" +
            "  // method.name => [method, url, params]\n" +
            "  b[`${d[0]}.${d[1]}`] = [d[0], d[2], d[3]];\n" +
            "}",
        ""
    ]);

    jsLine(`export function route(name, params = null, query={}) {`);
    jsLine(`return r(c, name, params, query);`);
    jsLines([`}`, ""]);

    jsLine(`export function routeStrict(name, params = null, query={}) {`);
    jsLine(`return r(c, name, params, query, true);`);
    jsLines([`}`, ""]);

    const ServerRequestsFilePath = `${folder}/ServerRequests.js`;
    const TsServerRequestsFilePath = `${folder}/ServerRequests.d.ts`;

    jsLine(`export default {`);
    for (const method of Controllers.keys()) {
        const methodRoutes = Controllers.get(method);

        /* Start Method Object Template */
        jsLine(`${method}: {`); // method: {
        tsLine(`${method}: {`);

        // console.log(methodRoutes)
        loopAllKeysOfMethod(methodRoutes);

        /* End Method Object Template */
        jsLine(`},`); // };
        tsLine(`},`); // };
    }

    JsContent.push("};");
    TsContent.push("};");
    TsContent.push("export default _default;");

    let content = JsContent.join(os.EOL);
    let tsContent = TsContent.join(os.EOL);

    content = beautify(content, { indent_size: 2, space_in_empty_paren: true });

    // find terser bin path
    let terserBinPath = require.resolve("terser").split("/terser/")[0];
    terserBinPath += "/terser/bin/terser";

    // minify js if minify is enabled.
    if (pluginConfig.minify) {
        try {
            content = execSync(
                `${terserBinPath} --compress --mangle -- ${ServerRequestsFilePath}`,
                {
                    encoding: "utf-8"
                }
            ).trim();
        } catch (e) {
            $.logError(e);
        }
    }

    tsContent = await pretty.format(tsContent, {
        semi: true,
        parser: "typescript",
        bracketSpacing: true,
        tabWidth: 2
    });

    // $.file.fs().writeFileSync(TsServerRequestsFilePath, tsContent);
    // $.file.fs().writeFileSync(ServerRequestsFilePath, content);

    // write to files only if content changed.
    // This prevents HMR in most frontend apps.
    const currentContent = $.file.read(ServerRequestsFilePath).toString();
    const currentTsContent = $.file.read(TsServerRequestsFilePath).toString();

    if (currentContent !== content) {
        $.file.fs().writeFileSync(ServerRequestsFilePath, content);
        $.logCalmly(`[FrontendHelper] Javascript file: ${ServerRequestsFilePath}`);
    }

    if (currentTsContent !== tsContent) {
        $.file.fs().writeFileSync(TsServerRequestsFilePath, tsContent);
        $.logCalmly(`[FrontendHelper] Typescript file: ${TsServerRequestsFilePath}`);
    }

    $.logSuccess("[FrontendHelper] ServerRequests file synced successfully.");

    /**
     * ================ FUNCTIONS ================
     */

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

                loopAllKeysOfMethod(route);

                jsLine(`},`);
                tsLine(`},`);
            }
        }
    }

    function setRouterNameFunction(shortName: string, route: ProcessedRouteData) {
        if (route && route.method) {
            const routeParams = getRouteParams(route.path as string);
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
                `${shortName}: (...args) => s(...p(b['${route.method}.${route.name}'], args)),`
            ]);

            /**
             * Typescript Lines.
             */

            let argumentsType!: string;

            // check for route params
            if (routeParamsKeys.length) {
                argumentsType = `params: {${paramsToTsType(routeParams)}} | SRParams`;
            }

            if (["post", "put", "patch"].includes(route.method.toLowerCase())) {
                if (argumentsType) {
                    argumentsType += `, body?: SRBody`;
                } else {
                    argumentsType = `body?: SRBody`;
                }
            } else {
                if (argumentsType) {
                    argumentsType += `, query?: SRQuery`;
                } else {
                    argumentsType = `query?: SRQuery`;
                }
            }

            argumentsType += `, config?: SRConfig, ...others: any[]`;

            let returnType = ts.returnType;

            if (returnType && typeof returnType === "function") returnType = returnType(route);
            const defaultTsType = `${shortName}<T=any>(${argumentsType}): ${returnType};`;

            tsLines(["", commentLines, defaultTsType]);
        }
    }
};
