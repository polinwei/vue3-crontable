import { terser } from "rollup-plugin-terser";

const config = {
	input: './output/src/index.js',
	output: [
		{
			dir: "dist",
		},
	],
  plugins: [terser()],
	external: ['vue']     
};

export default config;