import {namespace} from './use.json';
import {ConfigHelpers} from '@xpresser/plugin-tools'
import defaultConfig from './exports/config'

export = ConfigHelpers.loadPluginConfig({
    namespace,
    configFile: "frontend-helper",
    type: "function",
    default: defaultConfig,
}).pluginConfig;