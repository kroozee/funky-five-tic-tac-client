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


type Sort<T> = (left: T, right: T) => -1 | 0 | 1;

const emptySort = <T>(): Sort<T> => () => 0;

const reverseSort = <T>(sort: Sort<T>): Sort<T> => (left, right) => sort(right, left);

const sortThenBy = <T>(sort: Sort<T>, thenBy: Sort<T>): Sort<T> =>
    (left: T, right: T) => {
        const result = sort(left, right);
        return result === 0
            ? thenBy(left, right)
            : result;
    };

const alphaNumericSort: Sort<string | number> = (left, right) => {
    if (left === right) {
        return 0;
    }

    if (typeof left === 'string' && typeof right === 'string') {
        return left.toUpperCase() > right.toUpperCase() ? 1 : -1;
    }

    return Number(left) > Number(right) ? 1 : -1;
};

const buildAlphaNumericSort = <T>(...selectors: ((item: T) => string | number)[]): Sort<T> =>
    selectors
        .map<Sort<T>>(selector => (left, right) =>
            alphaNumericSort(selector(left), selector(right)))
        .reduce(sortThenBy, emptySort<T>());

export const orderBy = <T>(arr: T[] | readonly T[], ...selectors: ((item: T) => string | number)[]) =>
    [...arr].sort(buildAlphaNumericSort(...selectors));

export const orderByDesc = <T>(arr: T[] | readonly T[], ...selectors: ((item: T) => string | number)[]) =>
    [...arr].sort(reverseSort(buildAlphaNumericSort(...selectors)));