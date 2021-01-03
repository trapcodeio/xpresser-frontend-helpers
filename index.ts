import {compile} from "path-to-regexp";

export function parseUrl(data: [string, string, Record<string | number, boolean>], args: any[]) {
    let [method, url, params] = data;
    const paramsKeys = typeof params === "object" ? Object.keys(params) : [];
    const hasParams = paramsKeys.length > 0;

    if (hasParams) {
        let definedParams = args[0];
        if (typeof definedParams === "string" || typeof definedParams === "number") {

            if (paramsKeys.length === 1) {
                definedParams = {[paramsKeys[0]]: definedParams}
            } else {
                definedParams = [definedParams];
            }
        }

        if (Array.isArray(definedParams) && definedParams.length) {
            const definedParamsObject: Record<string, any> = {};
            for (const index in definedParams) {
                if (paramsKeys[index] !== undefined)
                    definedParamsObject[paramsKeys[index]] = definedParams[index];
            }

            definedParams = definedParamsObject;
        }
        
        const toPath = compile(url, {encode: encodeURIComponent});
        url = toPath(definedParams);
    }

    return [url, args];
}