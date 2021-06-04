// Stylelint configuration
module.exports = {
	extends: [
		'stylelint-config-sass-guidelines',
		//'stylelint-config-idiomatic-order'
	],

	plugins: [
		'stylelint-scss',
		'stylelint-order'
	],

	rules: {
		/**
		 * Override or add rules settings here
		 * See general rules https://github.com/stylelint/stylelint/blob/master/docs/user-guide/rules/list.md
		 * See plugin rules https://github.com/kristerkari/stylelint-scss#list-of-rules
		 */
		'at-rule-no-unknown': null,
		'declaration-block-trailing-semicolon': ['always', {ignore: ['single-declaration']}],
		'indentation': 'tab',
		'max-nesting-depth': 6,
		'no-eol-whitespace': true,
		'no-irregular-whitespace': true,
		'order/properties-alphabetical-order': null,
		'selector-max-id': 1,
		'selector-no-qualifying-type': null, // allow us to use element type to qualify styles
		'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep'] }],
		'scss/at-rule-no-unknown': true,
	}
};