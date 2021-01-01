import {namespace} from "../use.json";
import xpresser = require("xpresser");

const $ = xpresser.init({
    env: process.env["NODE_ENV"],
    name: `Testing Plugin: ${namespace}`,
    paths: {
        base: __dirname
    },
    server: {
        port: 2000
    }
})

$.initializeTypescript(__filename, (isNode) => {
    // console.log(isNode)
});


// $.on.boot(next  => {
//     console.log($.config.get('paths.routesFile'))
// })

$.boot();