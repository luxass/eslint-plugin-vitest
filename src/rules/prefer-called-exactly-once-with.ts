import { createEslintRule, getAccessorValue } from '../utils'
import { parseVitestFnCall } from '../utils/parseVitestFnCall'

export const RULE_NAME = 'prefer-called-exactly-once-with'
type MessageIds = 'preferCalledExactlyOnceWith';
type Options = [];

export default createEslintRule<Options, MessageIds>({
    name: RULE_NAME,
    meta: {
        docs: {
            description: 'Prefer `toHaveBeenCalledExactlyOnceWith` over `toHaveBeenCalledOnce` and `toHaveBeenCalledWith`',
            recommended: 'warn'
        },
        messages: {
            preferCalledExactlyOnceWith: 'Prefer {{matcherName}} (/* expected args */)'
        },
        type: 'suggestion',
        fixable: 'code',
        schema: []
    },
    defaultOptions: [],
    create(context) {
        return {
            CallExpression(node) {
                const vitestFnCall = parseVitestFnCall(node, context)

                if (vitestFnCall?.type !== 'expect')
                    return

                if (vitestFnCall.modifiers.some((node) => getAccessorValue(node) === 'not'))
                    return

                const { matcher } = vitestFnCall
                const matcherName = getAccessorValue(matcher)

                if (['toHaveBeenCalledOnce', 'toHaveBeenCalledWith'].includes(matcherName)) {
                    context.report({
                    data: {
                        matcherName
                        },
                        messageId: 'preferCalledExactlyOnceWith',
                        node: matcher,
                        fix: fixer => [fixer.replaceText(matcher, `${matcherName}ExactlyOnceWith`)]
                    })
                }
            }
        }
    }
})