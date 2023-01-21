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

    app.get('/day', async (req) => {
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

    app.patch('/habits/:id/toggle', async (req) => {

        const toogleHabits = z.object({
            id: z.string().uuid(),
        })
        const {id} = toogleHabits.parse(req.params)
        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique({
            where: {
                date: today
            }
        })
        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today,
                }
            })
        }

        const dayHabit = await prisma.dayhabits.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id
                }
            }
        })
        if (dayHabit) {
            await prisma.dayhabits.delete({
                where: {
                    id: dayHabit.id
                }
            })
        } else {
            await prisma.dayhabits.create({
                    data: {
                        day_id: day.id,
                        habit_id: id
                    }
                }
            )
        }


    })

    app.get('/summary', async () => {

        return prisma.$queryRaw`
      SELECT D.id, D.date,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT
            cast(count(*) as float)
          FROM week HDW
          JOIN habits H
            ON H.id = HDW.habit_id
          WHERE
            HDW.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= D.date
        ) as amount
      FROM days D
    `
    })

}

