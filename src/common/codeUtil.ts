export class CodeUtil {
    /**
     * trim unfoucs code.
     * @param origin any string
     */
    public static purity_greedy(origin: string): string {
        if (!origin) return '';
        // TODO: untest
        return origin
            .replace(/;.+/, '')
            .replace(/".*?"/g, '')
            .replace(/\{.*\}/g, '')
            .replace(/ +/g, ' ')
            .replace(/\bgui\b.*/gi, '')
            .replace(/\b(msgbox)\b.+?%/gi, '$1');
    }

    public static purity(origin: string, greedy: boolean = false): string {
        if (!origin) return '';
        // TODO: untest
        return origin
            .replace(/;.+/, '')
            .replace(/".*?"/g, '')
            .replace(/\{.*?\}/g, '')
            .replace(/ +/g, ' ')
            .replace(/\bgui\b.*/gi, '')
            .replace(/\b(msgbox)\b.+?%/gi, '$1');
    }

    public static join(array: any[], items: any | any[]) {
        if (array == undefined || items == undefined) {
            return;
        }
        if (Array.isArray(items)) {
            for (const item of items) {
                array.push(item);
            }
        } else {
            array.push(items);
        }
    }

    public static matchAll(regex: RegExp, text: string): RegExpExecArray[] {
        if (!regex.global) {
            throw new Error('Only support global regex!');
        }

        let regs = [];
        let temp: RegExpExecArray;
        while ((temp = regex.exec(text)) != null) {
            regs.push(temp);
        }

        return regs;
    }
}
