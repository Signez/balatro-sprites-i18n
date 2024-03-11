# Balatro sprite internationalization toolchain

This repository contains clean "blank" sprites, sprite elements and scripts used to generate **localized sprite sheets for the game Balatro**. Those sprite sheets can then be used in community mods to add new languages to the game.

Note that unless noted, all the content in this repository is derived from the Balatro game files, **© 2024 LocalThunk**. This is a fan project that is not affiliated with LocalThunk or PlayStack.

## How to use

1. Clone this repository
2. Run `npm install` to install the required dependencies
3. Run `node index.js` to generate the localized sprite sheets
4. The localized sprite sheets will be generated in the `dist/fr` folder, `fr` being the language code for `French` which is the only supported language at the moment.

## How to contribute

If you want to contribute to this project by translating the sprites to a new language, you can do so by creating a new folder in the `locales/` directory, using the language code as the folder name (e.g. `locales/fr` for French). Then, following the `locales/en` folder as a reference, you can add the translated sprite elements and texts.

If needed, you can tweak values used by the scripts in the `locale/xx/consumables.json` file, and request for a specific case to be handled by an new option in the scripts (please file an issue!).

## License

This project (**except all the artwork extracted or derivated from the Balatro game**) is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
