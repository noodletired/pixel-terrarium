// ESLint configuration options
const e = 2; // error
const w = 1; // warn
const o = 0; // off

module.exports = {
	env: {
		browser: true,
		amd: true,
		node: true,
		es2021: true
	},

	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		sourceType: 'module'
	},

	plugins: ['@typescript-eslint'],

	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:vue-scoped-css/vue3-recommended',
		'plugin:vue/vue3-recommended',
	],

	rules: {
		/**
		 * Override or add rules settings here
		 * See https://eslint.org/docs/rules
		 */
		'array-bracket-newline': ['error', 'consistent'],
		'array-bracket-spacing': [e, 'never'],
		'array-element-newline': [e, 'consistent'],
		'arrow-parens': [e, 'as-needed'],
		'block-spacing': e,
		'camelcase': [e, { allow: ['^[A-Z_]+$'] }], // allow CONST_
		'curly': e,
		'comma-dangle': [e, 'only-multiline', { functions: 'never' }],
		'comma-spacing': e,
		'eqeqeq': e,
		'func-call-spacing': e,
		'implicit-arrow-linebreak': e,
		'key-spacing': e,
		'keyword-spacing': [e, {
			before: true,
			after: true,
			overrides: { else: { before: false, after: true } }
		}],
		'max-len': [e, {
			code: 120,
			tabWidth: 2,
			ignoreComments: true,
			ignoreTrailingComments: true,
			ignoreTemplateLiterals: true
		}],
		'new-cap': [e, { capIsNew: false }],
		'no-multi-spaces': [e, { ignoreEOLComments: true }],
		'no-multiple-empty-lines': [e, { max: 2, maxEOF: 0, maxBOF: 0 }],
		'no-return-await': e,
		'no-trailing-spaces': e,
		'no-unexpected-multiline': w,
		'no-unsafe-optional-chaining': e,
		'no-useless-rename': e,
		'no-useless-return': e,
		'no-whitespace-before-property': e,
		'no-var': e,
		'object-curly-newline': [e, { multiline: true }],
		'object-curly-spacing': [e, 'always'],
		'object-property-newline': [e, { allowAllPropertiesOnSameLine: true }],
		'object-shorthand': [e, 'always', { avoidExplicitReturnArrows: true }],
		'one-var': [e, { initialized: 'never', uninitialized: 'consecutive' }],
		'padded-blocks': [e, 'never'],
		'prefer-arrow-callback': e,
		'prefer-destructuring': [e, { object: true, array: false }],
		'prefer-exponentiation-operator': w,
		'prefer-object-spread': w,
		'prefer-named-capture-group': w,
		'prefer-regex-literals': w,
		'prefer-template': w,
		'quote-props': [e, 'consistent-as-needed', { keywords: false }],
		'require-atomic-updates': e,
		'require-await': e,
		'semi': e,
		'semi-spacing': e,
		'space-infix-ops': e,
		'space-in-parens': [e, 'never'],
		'space-unary-ops': [e, { words: true, nonwords: false }],
		'sort-imports': [e, { allowSeparatedGroups: true }],
		'template-curly-spacing': e,

		/**
		 * Add Typescript ESLint plugin overrides here
		 * See https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules
		 */
		'brace-style': o,
		'indent': o,
		'no-duplicate-imports': o,
		'quotes': o,
		'space-before-function-paren': o,

		'@typescript-eslint/brace-style': [e, 'allman'],
		'@typescript-eslint/indent': [e, 'tab', { SwitchCase: 1 }],
		'@typescript-eslint/no-duplicate-imports': ['error', { includeExports: true }],
		'@typescript-eslint/no-non-null-assertion': o,
		'@typescript-eslint/quotes': [e, 'single', {
			allowTemplateLiterals: true,
			avoidEscape: true
		}],
		'@typescript-eslint/space-before-function-paren': [e, { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
		'@typescript-eslint/type-annotation-spacing': e,

		/**
		 * Add Vue ESLint plugin overrides here
		 * See https://eslint.vuejs.org/rules/
		 */
		'vue/block-tag-newline': e,
		'vue/camelcase': [e, { allow: ['^[A-Z_]+$'] }],
		'vue/component-definition-name-casing': [e, 'kebab-case'],
		'vue/custom-event-name-casing': [e, 'kebab-case'],
		'vue/component-name-in-template-casing': e,
		'vue/eqeqeq': e,
		'vue/html-indent': [e, 'tab', {
			alignAttributesVertically: false,
			baseIndent: 0
		}],
		'vue/html-quotes': [e, 'double', { avoidEscape: true }],
		'vue/max-attributes-per-line': [e, {
			singleline: { max: Infinity, allowFirstLine: true },
			multiline: { max: 1, allowFirstLine: false },
		}],
		'vue/no-duplicate-attr-inheritance': e,
		'vue/no-empty-component-block': w,
		'vue/no-invalid-model-keys': e,
		'vue/no-multiple-objects-in-class': e,
		'vue/no-reserved-component-names': ['error', {
			disallowVueBuiltInComponents: true,
			disallowVue3BuiltInComponents: true
		}],
		'vue/no-static-inline-styles': e,
		'vue/no-unused-properties': [w, {
			groups: ['props', 'data', 'computed', 'methods'],
			ignorePublicMembers: true
		}],
		'vue/no-unused-refs': w,
		'vue/no-unused-vars': e,
		'vue/no-useless-mustaches': [e, { ignoreStringEscape: true }],
		'vue/no-useless-v-bind': [e, { ignoreStringEscape: true }],
		'vue/padding-line-between-blocks': e,
		'vue/script-indent': [e, 'tab'],
		'vue/v-on-event-hyphenation': [e, 'always', { autofix: true }],
		'vue/v-on-function-call': e,
		'vue/valid-next-tick': e
	},

	ignorePatterns: ['config.js']
};
