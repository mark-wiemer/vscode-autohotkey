import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { SnippetString } from 'vscode';
import { Method, Variable } from '../parser/model';

// DeepPick provided by https://stackoverflow.com/a/74393523
type Head<T extends string> = T extends `${infer First}.${string}` ? First : T;
type Tail<T extends string> = T extends `${string}.${infer Rest}`
    ? Rest
    : never;
type DeepPick<T, K extends string> = T extends object
    ? {
          [P in Head<K> & keyof T]: T[P] extends readonly unknown[]
              ? DeepPick<T[P][number], Tail<Extract<K, `${P}.${string}`>>>[]
              : DeepPick<T[P], Tail<Extract<K, `${P}.${string}`>>>;
      }
    : T;

/**
 * A completion item for the method itself.
 * Also one for each of its local variables if the line number is within the method.
 */
// TODO add tests
export const completionItemsForMethod = (
    method: Pick<
        Method,
        | 'params'
        | 'name'
        | 'full'
        | 'comment'
        | 'uriString'
        | 'line'
        | 'endLine'
    > &
        DeepPick<Method, 'variables.name'>,
    uriString: string,
    lineNumber: number,
): vscode.CompletionItem[] => {
    const result: vscode.CompletionItem[] = [];

    // Always suggest the method itself
    const completionItem = new vscode.CompletionItem(
        method.params.length === 0 ? method.name : method.full,
        vscode.CompletionItemKind.Method,
    );
    completionItem.insertText = method.params.length
        ? new SnippetString(`${method.name} ($1)`)
        : `${method.name}()`;
    completionItem.detail = method.comment;
    result.push(completionItem);

    // If the cursor is in the method, suggest local variables
    if (
        method.uriString === uriString &&
        method.line <= lineNumber &&
        lineNumber <= method.endLine
    ) {
        // Local variables are all params and variables declared in the method
        const localVarNames = method.params.concat(
            method.variables.map((v) => v.name),
        );
        for (const localVar of localVarNames) {
            result.push(
                new vscode.CompletionItem(
                    localVar,
                    vscode.CompletionItemKind.Variable,
                ),
            );
        }
    }

    return result;
};

/**
 * Suggests all methods and the local vars of the current method, if any.
 * Suggests all variables provided.
 * @param methods The methods to suggest
 * @param uriString The URI of the current file
 * @param lineNumber The line number of the cursor
 * @param variables The variables to suggest
 * @returns The completion items
 */
// TODO add tests
export const provideCompletionItemsInner = async (
    methods: Method[],
    uriString: string,
    lineNumber: number,
    variables: Variable[],
): Promise<vscode.CompletionItem[]> => {
    const result: vscode.CompletionItem[] = [];

    methods.forEach((method) =>
        result.push(...completionItemsForMethod(method, uriString, lineNumber)),
    );

    variables.forEach((variable) =>
        result.push(
            new vscode.CompletionItem(
                variable.name,
                vscode.CompletionItemKind.Variable,
            ),
        ),
    );

    return result;
};

export class CompletionProvider implements vscode.CompletionItemProvider {
    // TODO add tests
    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.CompletionItem[]> {
        // If the cursor is just after a dot, don't suggest anything.
        // Default suggestions will still apply.
        const preChar = document.getText(
            new vscode.Range(position.translate(0, -1), position),
        );
        if (preChar === '.') {
            return [];
        }

        // Suggest all methods and the local vars of the current method, if any
        // Suggest all variables in the current file
        const methods = await Parser.getAllMethod();
        const script = await Parser.buildScript(document, { usingCache: true });
        return provideCompletionItemsInner(
            methods,
            document.uri.toString(),
            position.line,
            script.variables,
        );
    }
}
