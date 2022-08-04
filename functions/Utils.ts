import path from "path";
import fs from "fs";
import { parse } from "path-to-regexp";

/**
 * Makes a dir if it does not exist.
 * @param $path
 * @param $isFile
 */
export function makeDirIfNotExist($path: string, $isFile = false) {
    if ($isFile) {
        $path = path.dirname($path);
    }

    if (!fs.existsSync($path)) {
        fs.mkdirSync($path, { recursive: true });
    }

    return $path;
}

/**
 * Get Params url.
 * @param url
 */
export function getRouteParams(url: string) {
    const params = parse(url);
    const names: Record<string | number, boolean> = {};

    if (params.length > 1) {
        for (const param of params) {
            if (typeof param === "object") {
                names[param.name] = param.modifier !== "?";
            }
        }
    }

    return names;
}

/**
 * Params to type
 * @param params
 */
export function paramsToTsType(params: Record<string | number, boolean>) {
    let type = [];

    for (const param of Object.keys(params)) {
        params[param]
            ? type.push(`${param}: StringOrNumber`)
            : type.push(`${param}?: StringOrNumber`);
    }

    return type.join(",");
}
