require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const webRoutes = require('./routes/web');
const { db } = require('./firebase.js');
const UserServices = require('./services/UserService');
const StudentServices = require('./services/StudentService');
const FacultyServices = require('./services/FacultyService');
const MajorServices = require('./services/MajorService');
const TeacherServices = require('./services/TeacherService');


//console.log(process.env);

const app = express();
const port = process.env.PORT || 3004;
const hostname = process.env.HOST_NAME;

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_DEF);

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

//config template engine
configViewEngine(app);

//Khai bao router
app.use('/', webRoutes);

app.use(express.json());

// var cors = require("cors");
// app.use(cors({
//     origin: "*",
// }));

//===>User<=== BEGIN//
app.get('/api/user/getlist', UserServices.getList);

app.post('/api/user/add-user', UserServices.addUser);

app.post('/api/user/update-user', UserServices.updateUser);

app.post('/api/user/delete-user', UserServices.deleteUser);

app.get('/api/user/checkuser', UserServices.checkUser);
//===>User<=== END//

//===>Khoa<=== BEGIN//
app.get('/api/faculty/getlist', FacultyServices.getList);

app.post('/api/faculty/add-faculty', FacultyServices.addFaculty);

app.post('/api/faculty/update-faculty', FacultyServices.updateFaculty);

app.post('/api/faculty/delete-faculty', FacultyServices.deleteFaculty);
//===>Khoa<=== END//

//===>Nganh<=== BEGIN//
app.get('/api/major/getlist', MajorServices.getList);

app.post('/api/major/add-major', MajorServices.addMajor);

app.post('/api/major/update-major', MajorServices.updateMajor);

app.post('/api/major/delete-major', MajorServices.deleteMajor);
//===>Nganh<=== END//

//===>Student<=== BEGIN//
app.get('/api/student/getlist', StudentServices.getList);

app.post('/api/student/add-student', StudentServices.addStudent);

app.post('/api/student/update-student', StudentServices.updateStudent);

app.post('/api/student/delete-student', StudentServices.deleteStudent);
//===>Student<=== END//

//===>Teacher<=== BEGIN//
app.get('/api/teacher/getlist', TeacherServices.getList);

app.post('/api/teacher/add-teacher', TeacherServices.addTeacher);

app.post('/api/teacher/update-teacher', TeacherServices.updateTeacher);

app.post('/api/teacher/delete-teacher', TeacherServices.deleteTeacher);
//===>Teacher<=== END//



app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`);
});
