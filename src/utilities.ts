export type Grouping<T> = {
    key: string,
    values: T[]
};

export const groupBy = <T>(sequence: T[], selector: (arg: T) => string): Grouping<T>[] => {
    const groups: any = {};
    sequence.forEach(el => {
        const itemKeyValue: any = selector(el);
        if (itemKeyValue in groups === false) {
            groups[itemKeyValue] = [];
        }
        groups[itemKeyValue].push(el);
    });
    const result = Object.keys(groups).map(key => {
        return {
            key: key,
            values: groups[key]
        };
    });
    return result;
};
