import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Collection, Db, MongoClient } from "mongodb";
import { DBService } from "./dbInfo.service";
import { UserDocument } from "./dto/user.dto"

@Injectable() 
export class MongoService implements OnModuleDestroy, OnModuleInit {
    constructor(private readonly dbInfoService: DBService) {}
    private client: MongoClient
    db: Db
    coll: Collection<Document>

    async onModuleInit() {
        console.log(this.dbInfoService.getDataBaseInfo().url)
        console.log(this.dbInfoService.getDataBaseInfo().name)
        console.log(this.dbInfoService.getDataBaseInfo().coll)
        this.client = new MongoClient(this.dbInfoService.getDataBaseInfo().url);
        await this.client.connect();
        this.db = this.client.db(this.dbInfoService.getDataBaseInfo().name)
        this.coll = this.db.collection(this.dbInfoService.getDataBaseInfo().coll)
    }
    async onModuleDestroy() {
        await this.client.close()
    }

    async findOne(filter: any): Promise<UserDocument | null> {
        const document = await this.coll.findOne(filter);
        return document as unknown as UserDocument | null;
    }

    async hasAlready(filter: any): Promise<Boolean> {
        const document = await this.coll.findOne(filter)
        if (document != null) {
            return true
        }
        return false
    }
    

    async upsertOne(fData: any, updateData: any) {
        const found = await this.findOne(fData);
        if (found) {
            await this.coll.updateOne(fData, { $set: updateData });
        } else {
            await this.coll.insertOne(updateData);  
        }
    }

    async insert(updateData: any) {
        await this.coll.insertOne(updateData);  
    }
    
}