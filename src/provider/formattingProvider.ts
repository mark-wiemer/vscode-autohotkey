import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
    );
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    private static oneCommandList = [
        'ifnotexist',
        'ifexist',
        'ifwinactive',
        'ifwinnotactive',
        'ifwinexist',
        'ifwinnotexist',
        'ifinstring',
        'ifnotinstring',
        'if',
        'else',
        'loop',
        'for',
        'while',
        'catch',
    ];

    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        let formatDocument = '';
        let deep = 0;
        let tagDeep = 0;
        let oneCommandCode = false;
        let blockComment = false;

        for (let line = 0; line < document.lineCount; line++) {
            const originText = document.lineAt(line).text;
            if (originText.match(/ *\/\*/)) {
                blockComment = true;
            }
            if (originText.match(/ *\*\//)) {
                blockComment = false;
            }
            if (blockComment) {
                formatDocument += originText;
                if (line !== document.lineCount - 1) {
                    formatDocument += '\n';
                }
                continue;
            }
            const purityText = CodeUtil.purity_greedy(originText.toLowerCase());
            // console.log(purityText)
            let notDeep = true;

            if (
                purityText.match(/#ifwinactive$/) ||
                purityText.match(/#ifwinnotactive$/)
            ) {
                if (tagDeep > 0) {
                    deep -= tagDeep;
                } else {
                    deep--;
                }
                notDeep = false;
            }
            // \bword\b:whole words only, /i:case insensitive
            if (purityText.match(/\b(return)\b/i) && tagDeep === deep) {
                tagDeep == 0; //this does nothing
                deep--;
                notDeep = false;
            }

            if (purityText.match(/^\s*case.+?:\s*$/)) {
                tagDeep--;
                deep--;
                notDeep = false;
            } else if (purityText.match(/:\s*$/)) {
                if (tagDeep > 0 && tagDeep === deep) {
                    deep--;
                    notDeep = false;
                }
            }

            if (purityText.includes("}")) {
                if (!purityText.includes("}:")) {
                    deep--;
                }
                notDeep = false;
            }

            if (oneCommandCode && purityText.match(/{/) != null) {
                let temp = purityText.match(/{/).length;
                const t2 = purityText.match(/{[^{}]*}/);
                if (t2) {
                    temp = temp - t2.length;
                }
                if (temp > 0) {
                    oneCommandCode = false;
                    deep--;
                }
            }

            if (deep < 0) {
                deep = 0;
            }
            let comment: any = /;.+/.exec(originText);
            comment = comment ? comment[0] : '';

            const formatedText =
                originText
                    .replace(/^\s*/, '')
                    .replace(/;.+/, '')
                    .replace(/ {2,}/g, ' ') + comment;
            formatDocument +=
                !formatedText || formatedText.trim() == ''
                    ? formatedText
                    : ' '.repeat(deep * options.tabSize) + formatedText;
            if (line !== document.lineCount - 1) {
                formatDocument += '\n';
            }

            if (oneCommandCode) {
                oneCommandCode = false;
                deep--;
            }

            if (
                purityText.match(/#ifwinactive.*?\s/) ||
                purityText.match(/#ifwinnotactive.*?\s/)
            ) {
                deep++;
                notDeep = false;
            }

            if (purityText.includes("{")) {
                if (!purityText.includes("{:")) {
                    deep++;
                }
                notDeep = false;
            }

            if (purityText.match(/:\s*$/)) {
                deep++;
                tagDeep = deep;
                notDeep = false;
            }

            if (notDeep) {
                for (const oneCommand of FormatProvider.oneCommandList) {
                    let temp: RegExpExecArray;
                    if (
                        (temp = new RegExp('\\b' + oneCommand + '\\b(.*)').exec(
                            purityText,
                        )) != null &&
                        !temp[1].includes('/')
                    ) {
                        oneCommandCode = true;
                        deep++;
                        break;
                    }
                }
            }
        }
        const result = [];
        result.push(
            new vscode.TextEdit(
                fullDocumentRange(document),
                formatDocument.replace(/\n{2,}/g, '\n\n'),
            ),
        );
        return result;
    }
}
