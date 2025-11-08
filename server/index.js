require("dotenv").config();
const path = require('path');
process.env["NODE_CONFIG_DIR"] = path.join(__dirname, "config/");

const config = require("config");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
require("express-async-errors");
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const authRoutes = require("./src/routes/auth.route");
const doctorRoutes = require("./src/routes/doctor.route");
const departmentRoutes = require("./src/routes/department.route");
const doctorAvailabilityRoutes = require("./src/routes/doctor_availability.route");
const patientRoutes = require("./src/routes/patient.route");
const appointmentRoutes = require("./src/routes/appointment.route");
const medicalRecordRoutes = require('./src/routes/medical_record.route');
const metaRoutes = require('./src/routes/meta.route');
const supportRoutes = require('./src/routes/support.route');

const { error } = require("./src/middleware");
const rateLimit = require('./src/middleware/authRateLimit');
const passport = require('./src/providers/passport');


const app = express();

app.options("*", cors({ ...config.get("cors") }));
app.use(cors({ ...config.get("cors") }));
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimit);
app.use(passport.initialize());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Swagger docs
const openapi = fs.readFileSync(path.join(__dirname,'docs/openapi.yaml'),'utf8');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerOptions: { url: '/openapi.yaml' } }));
app.get('/openapi.yaml', (_, res)=> res.type('text/yaml').send(openapi));

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/doctors/:doctorId/availability', doctorAvailabilityRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/records', medicalRecordRoutes);
app.use('/api/v1/meta', metaRoutes);
app.use('/api/v1/support', supportRoutes);

const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use('*', (_, res) => { res.status(404).send({ message: 'Resource not found!' }); });
}

app.use(error);

const PORT = process.env.PORT || config.get('port') || 3000;
app.listen(PORT, () => console.log(`Healthcare server listening on port ${PORT}`));
