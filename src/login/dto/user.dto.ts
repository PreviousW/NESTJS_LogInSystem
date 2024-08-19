import { ObjectId } from "mongodb";

export class UserDocument {
    readonly _id: ObjectId;
    readonly uid: string;
    readonly nickname: string;
    readonly name: string;
    readonly email: string;
    readonly age: number;
}