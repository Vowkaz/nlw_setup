import {prisma} from "./prisma";
import dayjs from "dayjs";
import {z} from 'zod'
import {FastifyInstance} from 'fastify';

export async function a(app: FastifyInstance) {
    app.post('/habits', async (req) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(z.number().min(0).max(6))
        })
        const {title, weekDays} = createHabitBody.parse(req.body)

        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                week: {
                    create: weekDays.map(i => {
                        return {
                            week_day: i
                        }
                    })
                }
            }
        })
    })

    app.get('/day', async(req) => {
        const getDayParams = z.object({
            date: z.coerce.date()
        })

        const {date} = getDayParams.parse(req.query)
        const parsedDate = dayjs(date).startOf('day')
        const weekDay = parsedDate.get('day')

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date
                },
                week: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        })

        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true
            }
        })

        const completedHabits = day?.dayHabits.map(i => {
            return i.habit_id
        })

        return {
            possibleHabits,
            completedHabits
        }

    })


}

