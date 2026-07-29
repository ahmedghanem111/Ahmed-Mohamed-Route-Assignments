import { User } from "./User";

export class Note {

  constructor(
    public id: number,
    public title: string,
    public content: string,
    public user: User
  ) {}

  preview(): string {
    return this.content.substring(0, 20) + "...";
  }

}