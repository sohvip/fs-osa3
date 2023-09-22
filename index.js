require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: 'invalid number' })
  }

  next(error)
}

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('person', (request) => {
    if (request.method === 'POST') {
        return JSON.stringify(request.body)
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

// let persons = [
//   { 
//     "name": "Arto Hellas", 
//     "number": "040-123456",
//     "id": 1
//   },
//   { 
//     "name": "Ada Lovelace", 
//     "number": "39-44-5323523",
//     "id": 2
//   },
//   { 
//     "name": "Dan Abramov", 
//     "number": "12-43-234345",
//     "id": 3
//   },
//   { 
//     "name": "Mary Poppendieck", 
//     "number": "39-23-6423122",
//     "id": 4
//   }
// ]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
  .catch(error => next(error))
})

app.get('/info', async (request, response) => {
    const currentDate = new Date()
    const dateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'long'
    }
    const dateFormatted = new Intl.DateTimeFormat('en-GB', dateOptions).format(currentDate)
    Person.countDocuments({})
      .then(count => {
        response.send(`<p>Phonebook has info for ${count} people</p>${dateFormatted}<p>`)
      })
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)
  if (!body.name) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })
  console.log(person)
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
