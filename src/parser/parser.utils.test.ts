import { suite, test } from 'mocha';
import * as assert from 'assert';
import { pathsToBuild } from './parser.utils';
import sinon from 'sinon';
import { Dir, Dirent, promises } from 'fs';
import path from 'path';

const rootPath = path.join(__dirname, '..', '..', '..');
const mockDirName = 'e2e';

const mockDirStructure = {
    [mockDirName]: {
        'main.ahk': [],
        'main.ah1': [],
        'main.ext': [],
        'main.txt': [],
        sub: {
            'sub.ahk': [],
            'sub.ah1': [],
            'sub.ext': [],
            'sub.txt': [],
        },
    },
};
const createMockDir = (
    path: string,
    structure: Record<string, object | string[]>,
): Dir => ({
    path,
    close: async () => {},
    closeSync: () => {},
    read: async () => null,
    readSync: () => null,
    async *[Symbol.asyncIterator]() {
        for (const key of Object.keys(structure)) {
            yield createMockDirent(key, structure[key], path);
        }
    },
});

function createMockDirent(
    name: string,
    value: object | string[],
    parentPath: string,
): Dirent {
    return {
        name,
        isDirectory: () => typeof value === 'object' && !Array.isArray(value),
        isFile: () => Array.isArray(value),
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false,
        parentPath,
        path: `${parentPath}/${name}`,
    } as Dirent;
}

sinon
    .stub(promises, 'opendir')
    .callsFake(async (path: string): Promise<Dir> => {
        const relativePath = path.replace(rootPath, '').replace(/\\/g, '/');
        const parts = relativePath.split('/').filter(Boolean);
        let currentDir = mockDirStructure;

        for (const part of parts) {
            if (typeof currentDir === 'object' && part in currentDir) {
                currentDir = currentDir[part];
            } else {
                throw new Error(
                    `Path ${path} not found in mock directory structure`,
                );
            }
        }

        return createMockDir(
            path,
            currentDir as Record<string, object | string[]>,
        );
    });

suite.only('pathsToBuild', () => {
    after(() => {
        sinon.restore();
    });

    const tests: [
        name: string,
        args: Parameters<typeof pathsToBuild>,
        expected: Awaited<ReturnType<typeof pathsToBuild>>,
    ][] = [
        [
            'no exclusions',
            [path.join(rootPath, mockDirName), [], []],
            [
                'main.ahk',
                'main.ah1',
                'main.ext',
                'sub/sub.ahk',
                'sub/sub.ah1',
                'sub/sub.ext',
            ].map((e) => path.join(rootPath, mockDirName, e)),
        ],
        [
            'exclude .ext',
            [path.join(rootPath, mockDirName), [], ['*.ext']],
            ['main.ahk', 'main.ah1', 'sub/sub.ahk', 'sub/sub.ah1'].map((e) =>
                path.join(rootPath, mockDirName, e),
            ),
        ],
        [
            'exclude sub',
            [path.join(rootPath, mockDirName), [], ['sub/*'], console.log],
            ['main.ahk', 'main.ah1', 'main.ext'].map((e) =>
                path.join(rootPath, mockDirName, e),
            ),
        ],
        ['exclude all', [path.join(rootPath, mockDirName), [], ['*']], []],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, async () => {
            const result = await pathsToBuild(...args);
            assert.deepStrictEqual(result, expected);
        }),
    );
});
