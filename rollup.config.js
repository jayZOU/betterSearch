// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output: [
        {
            file: './dist/index.js',
            format: 'cjs'
        },
        {
            name: "BetterSearch",
            file: './dist/index.umd.js',
            format: 'umd'
        }
    ],
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
};