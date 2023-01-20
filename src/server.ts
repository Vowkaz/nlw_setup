/**
* Backend API REST:: Vowkaz 19/01/2023 created
 */
/**
 * Metodos HTTP : Get, Post, Put, Delete, Patch
 */
import Fastify from 'fastify'
import cors from '@fastify/cors'
import {PrismaClient} from '@prisma/client'

const app = Fastify()
const prisma = new PrismaClient()

app.register(cors)

app.get( '/', async () => {
    return prisma.habit.findMany({
        where: {
            title: {
                startsWith: 'beber'
            }
        }
    });
})

app.listen({
    port: 3333
}) .then(() => {
    console.log('server up')
})