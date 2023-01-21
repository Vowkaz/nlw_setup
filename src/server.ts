/**
* Backend API REST:: Vowkaz 19/01/2023 created
 */
/**
 * Metodos HTTP : Get, Post, Put, Delete, Patch
 */
import Fastify from 'fastify'
import cors from '@fastify/cors'
import {a} from "./lib/routes";

const app = Fastify()

app.register(cors)
app.register(a)



app.listen({
    port: 3333
}) .then(() => {
    console.log('server up')
})