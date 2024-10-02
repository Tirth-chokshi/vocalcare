'use server'

import prisma from "@/lib/prisma"

export async function getUser(userEmail){
    try {
        const findUser = await prisma.user.findFirst({
            where: {
                email: userEmail
            }
        })
        console.log(findUser)
    } catch (error) {
        
    }
}