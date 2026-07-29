export class Storage<T> {

    private items: T[] = [];

    addItem(item: T): void {
        this.items.push(item);
    }

    removeItem(index: number): void {
        this.items.splice(index, 1);
    }

    getAllItems(): T[] {
        return this.items;
    }

}