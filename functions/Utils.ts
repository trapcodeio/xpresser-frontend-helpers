import path = require("path");
import fs = require("fs");

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
        // fs.mkdirSync($path, {recursive: true});
    }

    return $path;
}