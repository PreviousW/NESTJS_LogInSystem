import { Controller, Get, Query, Redirect, Req, Res } from '@nestjs/common';
import { DBService } from './dbInfo.service';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { createHash } from 'crypto';

@Controller('auth')
export class LoginController {
    constructor(private readonly dbinfoService: DBService, private readonly userService: UserService) { }

    // @Get("hasher")
    // async hasher(@Query('nickname') nickname) {
    //     return this.userService.encodeAndHash(nickname)
    // }

    // @Get("hasher2")
    // async hasher2(@Query('nickname') nickname) {
    //     return (await this.userService.encodeAndHash(nickname)).slice(0, -2) //16af80390a2e17703f5d9162d5317ebfd9bf2af8635867c8d25af4914b4cf
    // }
    //216f8a10-0bfb-4ddf-af2d-b96c30800178

    @Get('loginUser')
    async login(@Query("id") id, @Query('pw') pw, @Query("redirectTo") redirectTo, @Req() req: Request, @Res() res: Response) {
        const sid = req.cookies['SESSION_ID'];
        if (await this.userService.getSession(sid) == null) {
            try {
                const uid = await this.userService.getUidById(id);
                const user = await this.userService.getUserByUid(uid)

                if (user.pw == pw) {
                    const sessionId = await this.userService.createSession(uid)

                    res.cookie('SESSION_ID', sessionId, { httpOnly: true })
                    res.redirect(redirectTo)
                }
            } catch {
                //close?
            }
        } else {
            res.send({err: "you've already logged in!"})
        }
    }

    @Get('getProfile')
    async getProfile(@Query("sessionId") sessionId, @Query("vKey") vKey, @Res() res: Response) {
        //const sessionId = req.cookies['SESSION_ID'];
        const session = await this.userService.getSession(sessionId);
        const user = await this.userService.getUserByUid(session.uid)
        
        if (vKey == (await this.userService.encodeAndHash(user.nickname)).slice(0, -2)) {
            res.status(200).send({
                uid: user.uid,
                id: user.id,
                email: user.email,
                age: user.age,
                name: user.name,
                nickname: user.nickname,
                role: user.role,
                pw: user.pw
            })
        }
    }//http://localhost:3000/auth/getProfile?sessionId=0480f971-9249-48ec-bc74-466976e3154f&vKey=c34dbe04494b72d144b18af437f06f93b8a4aaa4c66a9aa8ecaa60b7a080d

    @Get('logoutUser')
    async logout(@Query("redirectTo") redirectTo, @Req() req: Request, @Res() res: Response) {
        const sessionId = req.cookies['SESSION_ID'];
        if (sessionId != null) {
            await this.userService.deleteSession(sessionId);

            res.clearCookie('SESSION_ID')
            res.redirect(redirectTo)
        } else {
            res.send({err: "NOT FOUND"})
        }
    } 

    @Get('registerUser')
    async register(@Query('id') id, @Query('pw') pw, @Query('nickname') nickname, @Query('age') age, @Query('name') name, @Query('email') email, @Query('key') key, @Query('redirect') redirect, @Res() res) {
        if (key === await this.userService.encodeAndHash(nickname)) {
            // TODO: add sex
            await this.userService.createUser(id, pw, nickname, name, age, email, "member") //pw 저장 암호화 필요
            res.redirect(redirect)

        }
        // http://localhost:3000/auth/registerUser?id=id&pw=pw&nickname=nyaneo&age=17&name=오선우&email=email@mail.mai&key=c34dbe04494b72d144b18af437f06f93b8a4aaa4c66a9aa8ecaa60b7a080d61&redirect=https://naver.com
    }

    // @Get('admin')
    // async adminPage(@Req() req: Request, @Res() res: Response) {
    //     const sessionId = req.cookies['SESSION_ID'];
    //     if ((await this.userService.getUserByUid((await this.userService.getSession(sessionId)).uid)).role == "admin") {
    //         res.send("hi")
    //     } else {
    //         res.send("fuck u")
    //     }
    // }
}
