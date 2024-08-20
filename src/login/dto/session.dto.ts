import { ObjectId } from "mongodb";

export class SessionDocument {
    readonly _id: ObjectId;
    readonly sessionId: string;
    readonly uid: string;
    readonly createdAt: Date;
    readonly token: string;
}