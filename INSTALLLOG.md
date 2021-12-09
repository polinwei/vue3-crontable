# Install log

## 開發需要的套件
## Vue3
```
npm install -D vue@next 
```
## @types/node
TypeScript icon, indicating that this package has built-in type declarations
```
npm install -D @types/node
```
## bable
```
npm i -D  @babel/core @babel/preset-env @babel/register 
```
## typescript 
```
npm install --save-dev typescript
```
## 發佈需要的套件
## rollup & rimraf 
```
npm install --save-dev rollup rimraf 
```
Additional tools are needed:
- rimraf: which is the UNIX command rm -rf for Node.js
## Rollup plugin to minify generated es bundle. Uses terser under the hood.
```
npm i rollup-plugin-terser --save-dev
```

## 待確認安裝套件

npm install --save-dev @rollup/plugin-typescript 
npm install --save-dev @rollup/plugin-node-resolve 
npm install --save-dev @rollup/plugin-babel 

npm install --save-dev @open-wc/building-rollup deepmerge
- @open-wc/building-rollup: as a rollup plugin for integration between Rollup.js and TypeScript,
- deepmerge: a tool to merge enumerable properties or more objects deeply.

npm i -D ts-loader babel-loader
npm i -D rollup-plugin-vue






npm install -D webpack webpack-cli