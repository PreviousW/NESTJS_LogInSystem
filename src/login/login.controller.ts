import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { DBService } from './dbInfo.service';
import { UserService } from './user.service';
import { Request, Response } from 'express';

@Controller('login')
export class LoginController {
    constructor(private readonly dbinfoService: DBService, private readonly userService: UserService) {}

    @Get()
    async login(@Query("nickname") nickname, @Res() res: Response) {
        const uid = await this.userService.getUidByNickName(nickname);
        const sessionId = await this.userService.createSession(uid)

        res.cookie('SESSION_ID', sessionId, {httpOnly: true})
        res.send("logged in")
        console.log("success")
    }

    @Get("profile")
    async getProfile(@Req() req: Request , @Res() res: Response) {
        const sessionId = req.cookies['SESSION_ID'];
        const session = await this.userService.getSession(sessionId);
        res.status(200).send(`${(await this.userService.getUserByUid(session.uid)).name}님! 안녕하세요!`)
    }

    @Get('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        const sessionId = req.cookies['SESSION_ID'];
        await this.userService.deleteSession(sessionId);

        res.clearCookie('SESSION_ID')
        res.send("BYE!")
    }

    @Get('register')
    async register(@Query('nickname') nickname) {
        this.userService.createUser(nickname, "오선우", 17, "contact@previousw.dev")
    }

    @Get('req')
    async reqInfo(@Query('nickname') nickname): Promise<string> {
        const uid = await this.userService.getUidByNickName(nickname);
        console.log(uid);
        return uid;
    }
}
