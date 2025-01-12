const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

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
		{
			name: "@electron-forge/maker-flatpak",
			config: {
				options: {
					categories: ["Network", "FileTransfer"],
					mimeType: ["video/h264"],
				},
			},
		},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin", "linux"],
		},
		{
			name: "@electron-forge/maker-deb",
			config: {
				options: {
					maintainer: "Cleo Kiama",
					homepage: "https://github.com/CleoKiama/RapidShare",
				},
			},
		},
		{
			name: "@electron-forge/maker-rpm",
			config: {
				options: {
					homepage: "https://github.com/CleoKiama/RapidShare",
				},
			},
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
