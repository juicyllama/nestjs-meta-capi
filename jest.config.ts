module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	bail: true,
	detectOpenHandles: true,
	resetModules: true,
	forceExit: true,
	rootDir: 'src',
	testTimeout: 120000,
	// fix: use string instead of RegExp object
	testRegex: '.*\\.spec\\.ts$',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^@config/(.*)$': '<rootDir>/config/$1',
	},
	transform: {
		'^.+\\.(ts|tsx)$': [
			// fix regex syntax
			'ts-jest',
			{
				babel: true,
				tsConfig: 'tsconfig.json',
				isolatedModules: true,
			},
		],
	},
}
