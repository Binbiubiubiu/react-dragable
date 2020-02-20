import { IBundleOptions } from "father";

const options: IBundleOptions = {
  entry: "src/index.ts",
  file: "react-dragable",
  esm: { type: "babel", importLibToEs: true },
  cjs: "babel",
  umd: {
    name: "react-dragable",
    minFile: true,
    globals: {
      react: "React",
      "react-dom": "ReactDom"
    }
  },
  extractCSS: true,
  lessInBabelMode: true
};

export default options;
