import {prisma} from "./prisma";
import {FastifyInstance} from 'fastify';


export async function a(app: FastifyInstance) {
    app.get('/', async () => {
        return await prisma.habit.findMany({
            where: {
                title: {
                    startsWith: 'beber'
                }
            }
        });
    })
}