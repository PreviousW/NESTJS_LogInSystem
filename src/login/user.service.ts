import { Injectable } from "@nestjs/common";
import { MongoService } from "./mongo.service";
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from "mongodb";
import { SessionDocument } from "./dto/session.dto";
import { UserDocument } from "./dto/user.dto";
import { createHash, randomBytes } from "crypto";

@Injectable() 
export class UserService {
    constructor(private readonly mongoService: MongoService) {}

    async getUidByNickName(nickname: string): Promise<string> {
        const doc = await this.mongoService.findOne({nickname: nickname});
        return doc.uid
    }

    async getUidById(id: string): Promise<string> {
        const doc = await this.mongoService.findOne({id: id});
        return doc.uid
    }

    async getUserByUid(uid: string): Promise<UserDocument> {
        const doc = await this.mongoService.findOne({uid: uid});
        return doc
    }

    async createUser(id: string, pw: string, nickname: string, name: string, age: number, email: string, role: string) {
        const check = await this.mongoService.hasAlready({nickname: nickname})
        console.log(check)

        if (check) {
            return
        }

        let uid = Math.floor(Math.random() * (9999999999 - 1074318421 + 1)) + 1
        const uidValidationCheck = await this.mongoService.hasAlready({uid: uid})
        
        while (uidValidationCheck) { uid = Math.floor(Math.random() * (9999999999 - 1074318421 + 1)) + 1 }
        console.log({nickname: nickname, name: name, age: age, email: email, uid: uid})
        this.mongoService.upsertOne({nickname: nickname}, {nickname: nickname, name: name, age: age, email: email, uid: uid, id: id, pw: pw, role: role})

    }


    async createSession(uid: string): Promise<string> {
        const sessionId = uuidv4()


        this.mongoService.db.collection("sessions").insertOne({
            sessionId,
            uid,
            createdAt: new Date(),
        });

        return sessionId
    }

    async getSession(sessionId: string): Promise<SessionDocument | null> {
        const doc = await this.mongoService.db.collection("sessions").findOne({ sessionId })
        if (doc != null) {
            return doc as SessionDocument
        } else {
            return null
        }
    }

    async deleteSession(sessionId: string) {
        await this.mongoService.db.collection("sessions").deleteOne({ sessionId });
    }

    async encodeAndHash(key: string): Promise<string> {
        const b64Encoded = Buffer.from(key).toString('base64');
        const trimmedKey = b64Encoded.slice(0, -3);
        const hash = createHash('sha256').update(trimmedKey).digest('hex');
        return hash.slice(0, -1);
    }

  

}