module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "canvas/(.*)$": "<rootDir>/src/canvas/$1",
        "ui/(.*)$": "<rootDir>/src/ui/$1",
    },
}
