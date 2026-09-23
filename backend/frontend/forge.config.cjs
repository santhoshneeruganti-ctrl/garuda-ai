const {
  FusesPlugin,
} = require("@electron-forge/plugin-fuses");

const {
  FuseV1Options,
  FuseVersion,
} = require("@electron/fuses");


module.exports = {

  // =====================================================
  // PACKAGER
  // =====================================================

  packagerConfig: {

    // Store application files inside app.asar
    asar: true,

    // Product name
    name: "Garuda AI",

    // Executable name
    executableName: "Garuda AI",

    // Application metadata
    appBundleId:
      "com.garudaai.desktop",

    appCopyright:
      "Copyright © 2026 Garuda AI",
  },


  // =====================================================
  // NATIVE MODULE REBUILD
  // =====================================================

  rebuildConfig: {},


  // =====================================================
  // WINDOWS INSTALLER
  // =====================================================

  makers: [

    {
      name:
        "@electron-forge/maker-squirrel",

      config: {

        name:
          "garuda_ai",

        authors:
          "Garuda AI",

        description:
          "Garuda AI Desktop Companion",
      },
    },

  ],


  // =====================================================
  // PLUGINS
  // =====================================================

  plugins: [

    {
      name:
        "@electron-forge/plugin-auto-unpack-natives",

      config: {},
    },


    // ===================================================
    // ELECTRON FUSES
    // ===================================================

    new FusesPlugin({

      version:
        FuseVersion.V1,

      [FuseV1Options.RunAsNode]:
        false,

      [FuseV1Options.EnableCookieEncryption]:
        true,

      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]:
        false,

      [FuseV1Options.EnableNodeCliInspectArguments]:
        false,

      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]:
        true,

      [FuseV1Options.OnlyLoadAppFromAsar]:
        true,
    }),

  ],
};