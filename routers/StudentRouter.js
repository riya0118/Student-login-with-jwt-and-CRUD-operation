const router = require("express").Router();
const Student = require("../models/Student");

const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const checktoken = require("../jwt/checktoken");
const localStorage = require("localStorage");

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/login",
  check('username').not().isEmpty().withMessage("Username is required"),
  check('password').not().isEmpty().withMessage("Password is required"),
  async (req, res) => {
    try {
      let student = await Student.findOne({ username: req.body.username });
      if (student) {
        if (req.body.password == student.password) {
          const data = student;
          const token = jwt.sign({ student: data }, process.env.JWT_SECRET);
          student = {
            authtoken: token
          }
          localStorage.setItem('token', token);
          res.redirect("/students/list")
        }
        else {
          return res.send("Your password is incorrect");
        }
      }
      else {
        return res.send("Invalid credentials");
      }
    }
    catch (error) {
      console.log(error);
      res.status(500).send("Some error occur while login")
    }
  });

router.get("/list", checktoken, async (req, res) => {
  try {
    const student = await Student.find().select("-password");
    res.render("list", { students: student })
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occured")
  }
});

router.get("/add", (req, res) => {
  res.render("add");
});

router.post("/save", (req, res) => {
  const addStudent = new Student({
    rollno: req.body.rollno,
    name: req.body.name,
    age: req.body.age,
    sem: req.body.sem,
    username: req.body.username,
    password: req.body.password
  })
  addStudent.save((err, student) => {
    if(err) res.status(500).send(err);
    console.log(student._id + " inserted successfully to student collection");
    res.redirect("/students/list");
  })
})

router.get("/delete/:id", (req, res) => {
  Student.findByIdAndRemove({"_id": req.params.id }, (err, student) => {
    if(err) res.status(500).send(err);
    res.redirect("/students/list");
  })
})

router.get("/edit/:id", (req, res) => {
  Student.findById({"_id": req.params.id}, (err, student) => {
    if(err) res.status(500).send(err);
    if(!student) return res.status(404).send("No Data Found");
    res.render("edit", {student: student})
  })
})

router.post("/update", (req, res) => {
  Student.findOneAndUpdate({"_id": req.body._id}, {
    rollno: req.body.rollno,
    name: req.body.name,
    age: req.body.age,
    sem: req.body.sem,
    username: req.body.username
  }, {new: true}, (err, student) => {
    if(err) res.status(500).send(err);
    res.redirect("/students/list")
  })
})

module.exports = router;