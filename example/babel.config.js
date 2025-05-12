// 示例babel配置文件
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
          browsers: ["last 2 versions"],
        },
      },
    ],
    "@babel/preset-react", // 如果使用React
  ],
  env: {
    development: {
      plugins: [
        [
          "istanbul",
          {
            exclude: ["**/*.spec.js", "**/*.test.js", "**/node_modules/**"],
          },
        ],
      ],
    },
    test: {
      plugins: [
        [
          "istanbul",
          {
            exclude: ["**/*.spec.js", "**/*.test.js", "**/node_modules/**"],
          },
        ],
      ],
    },
    uat: {
      plugins: [
        [
          "istanbul",
          {
            exclude: ["**/*.spec.js", "**/*.test.js", "**/node_modules/**"],
          },
        ],
      ],
    },
  },
};
