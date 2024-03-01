const config = {
    transform: {
      "^.+\\.(t|j)sx?$": "@swc/jest",
    },
    testPathIgnorePatterns: ["/node_modules/"],
  };


  export default config