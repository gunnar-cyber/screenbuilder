# README

This is the screen builder repository. It contains devices and shared libraries.

### How do I get set up?

- Ensure you have Node >=16.14.2 installed (or run `nvm use` in the root)
- Install Yarn with `npm i -g yarn` (We are using Yarn Classic, version is in ./.yarn/releases)
- Run `yarn install` (Make sure you run this from the root directory)
- Run `yarn libs` to build the libraries (Make sure you run this from the root directory)
- Run a dev server with `yarn dev` from the device's root or `yarn workspace {workspaceName} dev`

### How to enable waveforms and other data from native

- Run Realiti in dev mode (on an iPad or Simulator) - ensure it is connected to your local network
- On the iPad, in the Realiti360 App, at the main menu, open `SB - DEBUG`. Take note of the Device Address
- In your browser running screenbuilder, add `?debug=DEVICE_ADDRESS` at the end
  of the URL. The connection should be established.

#### Loading Page on iPad
- On your computer, run the command to start dev server (see above) with `--host` option to expose on the network
- At the main menu, open `SB - DEBUG`
- Make sure the `Monitor Type` is correct
- In the `Load External Address` field put the server address without the `http://`
- Press the `Load` button
- When the page has loaded, tapping with 3 fingers twice on the iPad will refresh the same address

### Using Yarn

- Add GLOBAL packages using `yarn add {packageName} -W`
- Add packages using `yarn add {packageName}` from the device's root OR `yarn workspace {workspaceName} add {packageName}`
- Add dev dependencies using `yarn add {packageName} --dev`
- Remove packages with `yarn remove {packageName}`

### How to deploy?

- Run `yarn build:all` in root to build all devices, libraries and build-scripts (language translation). 
- Run `yarn build` in your device root after building the libraries or `yarn build` in root to build all. This will build to the dist folder.
- Copy the built files to the Realiti folder `Resources/ScreenBuilder`
- Deploy Realiti

### Crowdin translation 
- for device has crowdin config, need to setup .env file in device root with CROWDIN_TOKEN and CROWDIN_PROJECT_ID
- NOTE: ask someone who has access to the crowdin project about token and project id
```
CROWDIN_TOKEN=
CROWDIN_PROJECT_ID=
```


- NOTE: doing a release build from realiti with fastlane will build and copy the files

### Running tests

Command Line:
- Run `yarn test` in the device root or `yarn test` in root to run all.
VS Code:
- Install extension "Vitest".
External:
- see https://vitest.dev/guide/ui.html

### Creating a new device

- Use `yarn create vite` to create a new project in device folder
- Make sure `vite.config.ts` has `base: './'` and `outDir: ../../dist/[device folder]/`
- If using vue-router use `history: createWebHashHistory()` so it works without a server
- Add the shared libs as dependency
- Add the peer dependencies of the shared libs
- Setup the commands in package.json
- Setup tsconfig.json

If in doubt, check the other devices.

### Gotchas

- If the shared vuex module isn't added to the createStore function it will error with "TypeError: data is undefined" when trying to access the data
- When using defineComponent with typescript: need to supply return type of functions otherwise get "Property 'x' does not exist on type 'ComponentPublicInstance" when trying to access anything from "this" reference inside of the function
- When using Vuex (possibly just vuex-module-decorators) don't set a state as undefined otherwise it won't be available in the actions (ie it will always be undefined even after it's set in a mutator)
- Doing "import _ as name from 'file.json'" doesn't work correctly for production builds. Instead just import default (ie without "_ as")
- Not possible to use Pinia as typed property of a class then have that as a typed property of Vue defineComponent data, since the type becomes incompatible when assigning in mounted for instance. Changing the Pinia store property in the class to private will also cause the type to be modified by defineComponent, so can't pass the data in as parameter to a function which is expecting the original type. Solution is not to have the class as part of Vue data.
- Use `@-webkit-keyframes` for CSS Keyframes animations - Safari doesn't consider the transform scaling we are using when using normal `@keyframes` so elements may scale incorrectly
- Use background-image instead of image tags, otherwise on an iPad if the user long presses the image, a context menu will pop up
- An image was being cropped on viewport change (device rotation), preloading the image prevented this from happening
- When passing dependencies as arguments into library functions make sure the versions are compatible otherwise there will be an error comparing the types (note that the lock file will keep versions the same across npm installs)
- Don't have empty props in defineComponent otherwise typescript will complain in the template
- 26/11/2021 on this date there was an issue when trying to build the application with the powershell. Currently we need to build the application using gitbash
- When the Pinia store is in a separate package the getter properties don't update their reactivity cache and return an outdated value so return and call a function instead
- yarn version that we are using has issues on Windows running postinstall for a workspace when running install at root. Needed to move the postinstall to root and run using workspace command.
- When using a custom validator for a prop use the arrow function since the function shorthand breaks typescript's inference of ThisType causing compile errors. Fixed in typescript 4.7 https://github.com/vuejs/core/issues/2738 https://vuejs.org/guide/typescript/options-api.html#typing-component-props
- PIXIjs causes "WebGL context was lost" warning in Firefox as a result of testing for WebGL. https://github.com/pixijs/pixijs/issues/6494
- With Vite don't use ~ in the path when importing assets in css.
- Don't run any code until the imports are done otherwise a circular reference could give error "can't access lexical declaration". Run in App.vue component instead, or wrap in setTimeout.

### Dependency Update Notes
- On yarn 1.x because yarn 2 requires node 18+ https://yarnpkg.com/migration/guide and not tested latest on windows yet
- Pixijs 8.x has lots of changes so staying on 7.x