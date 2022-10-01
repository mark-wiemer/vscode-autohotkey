import * as assert from 'assert';
import { CodeUtil } from '../../../common/codeUtil';

suite('Code utils', () => {
    suite('purify', () => {
        // List of test data
        let dataList = [
            // {
            //     in: , // input test string
            //     rs: , // expected result
            // },
            {
                in: 'a := 5 ; comment',
                rs: 'a := 5 ',
            },
            {
                in: 'str := "string"',
                rs: 'str := ""',
            },
            {
                in: 'b := {str: "object"}',
                rs: 'b := ',
            },
            {
                in: 'str = legacy    text',
                rs: 'str = legacy text',
            },
            {
                in: 'Gui, %id%: Color, % color',
                rs: '',
            },
            {
                in: 'MsgBox % str . (var + 1)',
                rs: 'MsgBox str . (var + 1)',
            },
            {
                in: 'MouseGetPos, OutputVarX, OutputVarY, OutputVarWin, OutputVarControl',
                rs: 'MouseGetPos, OutputVarX, OutputVarY, OutputVarWin, OutputVarControl',
            },
        ];
        dataList.forEach((data) => {
            test("'" + data.in + "' => '" + data.rs + "'", () => {
                assert.strictEqual(CodeUtil.purify(data.in), data.rs);
            });
        });
    });
});