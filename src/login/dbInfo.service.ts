import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DBService {
    constructor(private readonly configService: ConfigService) {}

    getDataBaseInfo(): {url: string, name: string, coll: string } {
        const url = this.configService.get<string>('DB_ADDRESS')
        const name = this.configService.get<string>('DB_NAME')
        const coll = this.configService.get<string>('DB_COLLECTION')
        console.log(url)

        return {url, name, coll}
    }
}
