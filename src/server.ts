/**
* Backend API REST:: Vowkaz 19/01/2023 created
*/
/**
* Metodos HTTP : Get, Post, Put, Delete, Patch
*/
import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const app = Fastify()
const prisma = new PrismaClient()

app.get( '/', async () => {
    const habits = await prisma.habit.findMany({
        where: {
            title : {
                startsWith: 'beber'
            }
        }
    })

    return habits
})

app.listen({
    port: 3333
}) .then(() => {
    console.log('server up')
})