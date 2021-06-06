# Pixel Terrarium
A small project written in Typescript/SCSS on Vue3/Vite/Rollup.
It runs in WebGL via [PixiJS](https://www.pixijs.com/).

The project was inspired by an [old tweet](https://twitter.com/dekdev/status/759014144917905417) from the long-absent indie game developer of Path to the Sky, [@dekdev](https://twitter.com/dekdev/).
![Inspiration](/doc/dekdev-inspiration.png)

## Project setup
Install nodejs/npm and required packages on Ubuntu 18.04 with the command:
```
./setup.sh
```

### Compile and hot-reload for development
```
npm run dev
```

### Bundle for production
```
npm run build
```

### Customize configuration
Modify `public/config.js` to configure interface options.
This file is excluded from bundling and can be modified post-build in the `dist` directory.

For build configuration see [Vite Configuration Reference](https://vitejs.dev/config/).

Linting rules don't comply to a common standard; they are borrowed from my current workplace.
Modify `.eslintrc.js` and `.stylelintrc.js` to configure JS/TS/Vue and SCSS linting options.