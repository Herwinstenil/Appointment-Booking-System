require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Middleware to check role
const checkRole = (roles) => {
  return (req, res, next) => {
    // Assuming user is attached via auth middleware, for now skip
    // In real app, verify JWT and check role
    next();
  };
};

// Routes

// Get all users (Admin only)
app.get('/api/users', checkRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (Admin/Client)
app.post('/api/users', checkRole(['ADMIN', 'CLIENT']), async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, password, name, role },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments for user
app.get('/api/appointments', async (req, res) => {
  const { userId } = req.query;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  const { title, description, date, userId } = req.body;
  try {
    const appointment = await prisma.appointment.create({
      data: { title, description, date: new Date(date), userId },
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status (Admin/Client)
app.put('/api/appointments/:id', checkRole(['ADMIN', 'CLIENT']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
