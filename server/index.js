require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (_request, response) => {
  response.json({
    message: 'CampusConnect API is running',
    endpoints: {
      health: '/api/health',
      registrations: '/api/registrations',
    },
  })
})

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true },
  studentId: { type: String, required: true, trim: true, unique: true },
  dob: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  department: { type: String, required: true },
  gender: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  backlogs: { type: Number, required: true, min: 0 },
  companies: { type: [String], required: true, validate: (value) => value.length === 4 },
}, { timestamps: { createdAt: 'submittedAt', updatedAt: false } })

const Registration = mongoose.model('Registration', registrationSchema)

app.get('/api/registrations', async (_request, response) => {
  try {
    const registrations = await Registration.find().sort({ submittedAt: -1 }).lean()
    response.json(registrations)
  } catch (error) {
    console.error('Failed to load registrations:', error)
    response.status(500).json({ message: 'Unable to load registrations' })
  }
})

app.post('/api/registrations', async (request, response) => {
  try {
    const registration = await Registration.create(request.body)
    response.status(201).json(registration)
  } catch (error) {
    console.error('Failed to save registration:', error)
    const status = error.code === 11000 || error.name === 'ValidationError' ? 400 : 500
    response.status(status).json({
      message: status === 400 ? 'Please check the registration details and try again' : 'Unable to save registration',
    })
  }
})

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => console.log(`Server listening on port ${port}`))
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exitCode = 1
  })