# Balatro sprite internationalization toolchain

This repository contains clean "blank" sprites, sprite elements and scripts used to generate **localized sprite sheets for the game Balatro**. Those sprite sheets can then be used in community mods to add new languages to the game.

For now, those localized sprites are used in the **[Better French translation mod](https://github.com/FrBmt-BIGetNouf/balatro-french-translations)** and the **[BalatRO Romanian translation mod](https://github.com/olenicandrei/balatro-romanian-translations)**. You can use this repository to create your own localized sprite sheets for your language — feel free to create pull requests to add new languages!

Note that unless noted, all the content in this repository is derived from the Balatro game files, **© 2024 LocalThunk**. This is a fan project that is not affiliated with LocalThunk or PlayStack.

## How to use

1. Clone this repository
2. Run `npm install` to install the required dependencies
3. Do the localization work inside the `locales/xx` folder, `xx` being the language code for the language you want to translate the sprites to!
4. Run `node index.js xx` to generate the localized sprite sheets for the language `xx`

The localized sprite sheets will be generated in the `dist/xx` folder, in both `1x` and `2x` resolutions. A test will be run to check if the sprites alpha is the same as the original, reference sprites (in `test/reference`).

## How to contribute

If you want to contribute to this project by translating the sprites to a new language, you can do so by creating a new folder in the `locales/` directory, using the language code as the folder name (e.g. `locales/fr` for French). Then, following the `locales/en` folder as a reference, you can add the translated sprite elements and texts.

If needed, you can tweak values used by the scripts in the `locale/xx/consumables.json` file, and request for a specific case to be handled by an new option in the scripts (please file an issue!).

## License

This project (**except all the artwork extracted or derivated from the Balatro game**) is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
