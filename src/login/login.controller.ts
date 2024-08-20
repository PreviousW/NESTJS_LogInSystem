import { Controller, Get, Query, Redirect, Req, Res } from '@nestjs/common';
import { DBService } from './dbInfo.service';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { createHash } from 'crypto';

@Controller('login')
export class LoginController {
    constructor(private readonly dbinfoService: DBService, private readonly userService: UserService) { }

    // @Get("hasher")
    // async hasher(@Query('nickname') nickname) {
    //     return this.userService.encodeAndHash(nickname)
    // }


    @Get()
    async login(@Query("nickname") nickname, @Req() req: Request, @Res() res: Response) {
        const sid = req.cookies['SESSION_ID'];
        if (await this.userService.getSession(sid) == null) {
            const uid = await this.userService.getUidByNickName(nickname);
            const sessionId = await this.userService.createSession(uid)

            res.cookie('SESSION_ID', sessionId, { httpOnly: true })
            res.send("logged in")
            console.log("success")
        } else {
            res.send("you've already logged in!")
        }
    }

    @Get("profile")
    async getProfile(@Req() req: Request, @Res() res: Response) {
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

    @Get('registerUser')
    async register(@Query('id') id, @Query('pw') pw, @Query('nickname') nickname, @Query('age') age, @Query('name') name, @Query('email') email, @Query('key') key, @Query('redirect') redirect, @Res() res) {
        if (key === await this.userService.encodeAndHash(nickname)) {
            console.log("sex")
            await this.userService.createUser(id, pw, nickname, name, age, email, "member") //pw 저장 암호화 필요
            res.redirect(redirect)

        }
        // http://localhost:3000/login/registerUser?id=id&pw=pw&nickname=nyaneo&age=17&name=오선우&email=email@mail.mai&key=c34dbe04494b72d144b18af437f06f93b8a4aaa4c66a9aa8ecaa60b7a080d61&redirect=https://naver.com
    }

    @Get('req')
    async reqInfo(@Query('nickname') nickname): Promise<string> {
        const uid = await this.userService.getUidByNickName(nickname);
        console.log(uid);
        return uid;
    }

    @Get("admin")
    async adminPage(@Req() req: Request, @Res() res: Response) {
        const sessionId = req.cookies['SESSION_ID'];
        if ((await this.userService.getUserByUid((await this.userService.getSession(sessionId)).uid)).role == "admin") {
            res.send("hi")
        } else {
            res.send("fuck u")
        }
    }
}
