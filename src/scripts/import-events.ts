import fs from 'fs'
import { parse } from 'csv-parse'
import { PrismaClient } from '@prisma/client';
import { Event } from '../types';

const prisma = new PrismaClient();

export const importEvents = async () => {
  console.log('[RUNNING SCRIPT] importEvents')

  const allRows: Event[] = []

  fs.createReadStream('./src/files/events.csv')
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      allRows.push({
        preferences: null,
        class_code: row[0],
        subject_code: row[1],
        subject_name: row[2],
        professor: row[3],
        start_period: row[4],
        end_period: row[5],
        created_by: row[6],
        week_day: row[7],
        start_time: row[8],
        end_time: row[9],
        building: row[10],
        classroom: row[11],
        class_type: '',
        has_to_be_allocated: false,
        vacancies: 0,
        updated_at: new Date().toString(),
        pendings: 0,
        subscribers: 0,
        id: 'Teste'
      })
    })
    .on('end', () => {
      console.log('[RUNNING SCRIPT] CSV file successfully processed')
      console.log(allRows)
      console.log('total rows: ', allRows.length)
    })
    .on('error', (error) => {
      console.log(error)
    })

  // const createdClasses = await prisma.events.findMany()
  // const eventsToBeCreated = removeDuplicateEvents(allRows, createdClasses)

  // const classes = await prisma.events.createMany({
  //   data: eventsToBeCreated
  // })

  // console.log('Created classes:', classes)
}

const removeDuplicateEvents = (newEvents: Event[], events: Event[]) => {
  const eventsToBeCreated = newEvents.filter(newEvent => {
    const eventExists = events.find(event => (
      event.class_code === newEvent.class_code &&
      event.subject_code === newEvent.subject_code && 
      event.subject_name === newEvent.subject_name &&
      event.professor === newEvent.professor &&
      event.start_period === newEvent.start_period &&
      event.end_period === newEvent.end_period &&
      event.week_day === newEvent.week_day &&
      event.start_time === newEvent.start_time &&
      event.end_time === newEvent.end_time &&
      event.building === newEvent.building &&
      event.classroom === newEvent.classroom
    ))

    return !eventExists
  })

  return eventsToBeCreated
}

importEvents()