import { compile } from "path-to-regexp";
import BuildUrl from "build-url";

type StringOrNumber = string | number;
type SRParams = StringOrNumber | StringOrNumber[] | Record<StringOrNumber, any>;
type SRQuery = Record<StringOrNumber, StringOrNumber>;

export function parseUrl(
    data: [string, string, Record<StringOrNumber, boolean>],
    args: any[],
    strict: boolean = false
) {
    // Get method, url and params form data passed.
    let [method, url, params] = data;

    // Hold ParamKeys
    const paramsKeys = typeof params === "object" ? Object.keys(params) : [];

    /* Check if request has Parameters */
    if (paramsKeys.length > 0) {
        // Hold defined Params
        let definedParams = args[0];

        // if defined params is a string or number
        // change to array or to object if params is only 1
        url = SRParamsToObject(url, params, definedParams, strict);

        // Remove params from args
        args.shift();
    }

    let query: Record<string, any> = {};
    let body: Record<string, any> = {};

    if (["put", "post", "patch"].includes(method)) {
        body = args[0] || {};
    } else {
        query = args[0] || {};
    }

    return [url, { method, query, body, ...(args[1] || {}) }, args[2] || []];
}

export function parseUrlStrict(
    data: [string, string, Record<StringOrNumber, boolean>],
    args: any[]
) {
    return parseUrl(data, args, true);
}

export function internalRouteParser(
    api: Record<string, any[]> = {},
    name: string,
    params: SRParams = {},
    query: SRQuery = {},
    strict: boolean = false
) {
    if (!api.hasOwnProperty(name)) {
        throw new Error(`Route name: ${name} does not exist in generated routes`);
    }
    const thisRoute = api[name];
    let url = SRParamsToObject(thisRoute[0], thisRoute[1], params, strict);
    if (typeof query === "object" && Object.keys(query).length) {
        url = BuildUrl(url, { queryParams: query as any });
    }
    return url;
}

function SRParamsToObject(
    url: string,
    expectedParams: any,
    definedParams: any,
    strict: boolean = false
) {
    const paramsKeys = typeof expectedParams === "object" ? Object.keys(expectedParams) : [];

    if (paramsKeys.length) {
        if (typeof definedParams === "string" || typeof definedParams === "number") {
            if (paramsKeys.length === 1) {
                definedParams = { [paramsKeys[0]]: definedParams };
            } else {
                definedParams = [definedParams];
            }
        }

        // if definedParams is an array we convert to object.
        if (Array.isArray(definedParams) && definedParams.length) {
            const definedParamsObject: Record<string, any> = {};
            for (const index in definedParams) {
                if (paramsKeys[index] !== undefined)
                    definedParamsObject[paramsKeys[index]] = definedParams[index];
            }

            definedParams = definedParamsObject;
        }

        // Compile path
        const toPath = compile(url, { encode: encodeURIComponent, validate: strict });
        return toPath(definedParams);
    }

    return url;
}
