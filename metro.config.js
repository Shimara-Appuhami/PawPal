// Prefer the WASM build of lightningcss in CI/EAS where native binaries
// may be unavailable or incompatible.
process.env.LIGHTNINGCSS_USE_WASM = process.env.LIGHTNINGCSS_USE_WASM || "1";

// Hard override Node's module resolver so any attempt to load lightningcss's
// native bindings resolves to the WASM implementation instead. This runs
// BEFORE requiring nativewind/metro which indirectly requires lightningcss.
const Module = require("module");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
	if (
		request === "lightningcss" ||
		request === "lightningcss/node" ||
		request === "lightningcss/node/index" ||
		request === "lightningcss/node/index.js"
	) {
		return require.resolve("lightningcss-wasm");
	}
	return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// No Metro resolver override needed: Node-level hook above handles resolution.

module.exports = withNativeWind(config, { input: "./global.css" });