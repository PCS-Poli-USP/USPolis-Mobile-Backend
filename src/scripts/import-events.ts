import fs from 'fs'
import { parse } from 'csv-parse'
import { Schema, model, connect } from 'mongoose';
import { format } from 'date-fns'


interface IEvent {
  class_code?: string,
  subject_code?: string,
  subject_name?: string,
  week_day?: string,
  class_type?: string,
  start_period?: string,
  end_period?: string,
  start_time?: string,
  end_time?: string,
  has_to_be_allocated?: boolean
  pendings?: number
  subscribers?: number,
  vacancies?: number,
  created_by?: string,
  updated_at?: string,
  preferences?: any,
  professor?: string,
  classroom?: string,
  building?: string,
}

// 2. Create a Schema corresponding to the document interface.
const eventSchema = new Schema<IEvent>({
  class_code: String,
  subject_code: String,
  subject_name: String,
  week_day: String,
  class_type: String,
  start_period: String,
  end_period: String,
  start_time: String,
  end_time: String,
  has_to_be_allocated: Boolean,
  pendings: Number,
  subscribers: Number,
  vacancies: Number,
  created_by: String,
  updated_at: String,
  preferences: Object,
  professor: String,
  classroom: String,
  building: String,
});

// 3. Create a Model.
const Event = model<IEvent>('events', eventSchema);

export const importEvents = async () => {
  console.log('[RUNNING SCRIPT] importEvents')

  const allRows: any[] = []

  fs.createReadStream('./src/files/Alocações elétrica - unificado.csv')
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
      allRows.push({
        class_code: row[0],
        subject_code: row[1],
        subject_name: row[2],
        professor: row[3],
        week_day: row[7],
        building: row[10],
        classroom: row[11],
        
        // Veirificar formato
        start_time: row[8],
        end_time: row[9],
        
        // Verificar se bate com formato do banco
        start_period: row[4],
        end_period: row[5],
        
        // Verificar se o formato da data vem correto
        created_by: row[6],
        updated_at: format(new Date(), "dd/MM/yyyy HH:mm"),
        
        // Parametros colocados de maneira duvidosa:
        class_type: '',
        has_to_be_allocated: false,
        vacancies: 0,
        pendings: 0,
        subscribers: 0,
        preferences: {
          accessibility: false,
          air_conditioning: false,
          building: "Elétrica",
          projector: false
        },

        // Mudar ID para correto
        // id: v4().replace(/-/gi, '')
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

  await connect("mongodb://localhost:27017/uspolis");

  const createdClasses = await Event.find()
  const eventsToBeCreated = removeDuplicateEvents(allRows, createdClasses)

  const classes = await Event.insertMany(eventsToBeCreated)
  console.log('Created classes:', classes)
}

const removeDuplicateEvents = (newEvents: any[], events: any[]) => {
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