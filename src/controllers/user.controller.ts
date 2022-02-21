import {Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import User, { IUSER} from '../models/user'
import config from '../config/config'

function createToken(user: IUSER) {

    var token = jwt.sign({id: user.id, email: user.email}, config.jwtSecret, {
        expiresIn: 86400
    }) 

    return token
}

export const signUp = async (req: Request, res: Response): Promise<Response> => {

    if(!req.body.email || !req.body.password) {
        return res.status(400).json({msg: "please send email and pass"})
    }

    const user = await User.findOne({email: req.body.email})

    if(user) {
        return res.status(400).json({msg: "user already exists"})
    }

    const newUser = new User(req.body)
    await newUser.save()

    return res.status(201).json(newUser)
}

export const signIn = async (req: Request, res: Response) => {
    
    if(!req.body.email || !req.body.password) {
        return res.status(400).json({msg: "please send email and pass"})
    }  

    const user = await User.findOne({email: req.body.email})
    console.log(user)
    if(!user) {
        return res.status(404).json({msg: "user does not exists"})
    }

    const isMatch = await user.comparePassword(req.body.password)

    if(isMatch) {
        return res.status(200).json({token: createToken(user)})
    }

    return res.status(400).json({msg: "email or password are incorrect"}) 

}