; [Issue #185](https://github.com/mark-wiemer/vscode-autohotkey-plus-plus/issues/185)
foo () {
/*
typedef struct TEST {
DWORD cbSize;          0
} CMINVOKECOMMANDINFOEX;
*/
/*
MsgBox, This line is commented out (disabled).
MsgBox, Common mistake: */ this does not end the comment.
MsgBox, This line is commented out. 
*/
/*
bar() {
Loop, 4 {
MsgBox % A_Index
}
if (true) {
SoundBeep
} else {
MsgBox
}
}
if (true)
ToolTip
*/
MsgBox
}