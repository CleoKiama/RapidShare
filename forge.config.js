require("dotenv").config();
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

console.log("GitHub Token exists:", !!process.env.GITHUB_TOKEN);
module.exports = {
	packagerConfig: {
		asar: true,
	},
	publishers: [
		{
			name: "@electron-forge/publisher-github",
			config: {
				repository: {
					owner: "CleoKiama",
					name: "RapidShare",
				},
				prerelease: true,
				authToken: process.env.GITHUB_TOKEN, // GitHub personal access token
				draft: false, // Whether to create releases as drafts
				tagPrefix: "v", // Prefix for tag names
				removeAssets: true, // Remove existing assets with the same name
			},
		},
	],
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {},
		},
		//{
		//	name: "@electron-forge/maker-flatpak",
		//	config: {
		//		options: {
		//			categories: ["Network", "FileTransfer"],
		//			mimeType: ["video/h264"],
		//			runtime: "org.freedesktop.Platform",
		//			runtimeVersion: "23.08",
		//			sdk: "org.freedesktop.Sdk",
		//			base: "org.electronjs.Electron2.BaseApp",
		//			baseVersion: "23.08",
		//			finishArgs: [
		//				"--share=network",
		//				"--share=ipc",
		//				"--socket=x11",
		//				"--socket=wayland",
		//				"--filesystem=home",
		//			],
		//		},
		//	},
		//},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin", "linux"],
		},
	],
	plugins: [
		{
			name: "@electron-forge/plugin-auto-unpack-natives",
			config: {},
		},
		{
			name: "@electron-forge/plugin-webpack",
			config: {
				devContentSecurityPolicy:
					"default-src 'self' 'unsafe-eval' 'unsafe-inline' static: http: https: ws:",
				devServer: {
					port: 8080, // replace with your desired port number
				},
				mainConfig: "./webpack.main.config.js",
				renderer: {
					config: "./webpack.renderer.config.js",
					entryPoints: [
						{
							html: "./src/renderer/index.html",
							js: "./src/renderer/renderer.js",
							name: "main_window",
							preload: {
								js: "./src/main/preload.js",
							},
						},
					],
				},
			},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
