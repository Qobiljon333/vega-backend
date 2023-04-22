const express = require("express")
const router = express.Router()
const { Students, studentsValidate, studentsValidate2 } = require("../../models/studentSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv/config")
const auth = require("../../middleware/auth")
const owner = require("../../middleware/admin")





// Method: Get
// Desc : get all teachers
router.get("/all-students", async(req, res)=>{
    try{
        let students = await Students.find()
        res.json({msg:"Successfully",students, state: true })
    }   
    catch{
        res.json("something went wrong")
    }
})
// Method Get
// Get groupmates
router.get("/groupmates/:id", async(req,res) => {
  try{
     const {id} = req.params
     const groupmates = await (await Students.find()).filter(student => student.mainLessons.includes(id))

     if (!groupmates.length) {
        return res.json({
          state:false,
          msg:"Students are not found",
          data:groupmates
        })
     }

     res.json({
      state:true,
      msg:"Successfully",
      data:groupmates
     })
     
  }
  catch(err){
    res.json("smth went wrong ",err)
  }
})
// Method : Get
// Get teacher's student
router.get("/special/:teacher", async(req, res) =>{
  try{
    const {teacher} = req.params

    const students = await (await Students.find()).filter(student => student.teachers.includes(teacher))
    if (!students) {
      return res.json({
        state:false,
        msg:"Students are not found",
        data:students
      })
    }

    res.json({
      state:true,
      msg:"Successfully",
      data:students
    })

  }
  catch(err){
    res.json("smth went wrong",err)
  }
})

// Method: Get
// Desc:   Get one Student by id
router.get("/:id", async (req, res) => {
    try {
      const student = await Students.findById(req.params.id);
  
      if (!student) {
        return res.status(404).json({
          state: false,
          msg: "not found",
          data: student,
        });
      }
  
      res.status(200).json({
        state: true,
        msg: "successfully found",
        data: [student],
      });
    } catch (err) {
      res.send(err);
    }
});

// Method: Get
// get more student
router.get("/see-more-student/:studentCount", async (req, res) => {
  try{
    const {studentCount} = req.params
    const students = await Students.find().limit(studentCount)

    res.json({
      state:true,
      msg:"Successfully",
      data:students
    })
  }
  catch(err){
    res.json("smth went wrong",err)
  }
})


// Method : Post 
// Create STUDENT 
router.post("/sign-up",  async(req, res)=>{
    try{
        const {error} = studentsValidate(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false } )
        }
        const { name, username , password  , image , connection , desc } = req.body
        const user = await Students.findOne({username})
        if(user){
            return res.json({msg:"username is already been declared", user: {}, state: false } )
        }
        const newUser = await Students.create({username, password, name, image, connection,desc, student:true, offLineLesson:[] , mainLessons:[],overallLessons:[] ,overallLessonsCount:0 ,teachers:[], lessons:[], })
        const salt = await bcrypt.genSalt(10)
        newUser.password = await bcrypt.hash(newUser.password, salt)
        const savedUser = await newUser.save()
        res.json({msg:"successfully Student is saved", user: savedUser, state: true })
    }
    catch{
        res.json("something went wrong")
    }
})

// Method : Post
// sign-in
router.post("/sign-in", async(req, res)=>{
    try{
        const {error} = studentsValidate2(req.body)
        if(error){
            return res.json({msg:error.details[0].message, user: {}, state: false })
        }
        const user = await Students.findOne({username: req.body.username})
        if(!user){
            return res.json({msg:"username or password is incorrect", user: {}, state: false } )
        }
        const validUser = await bcrypt.compare(req.body.password, user.password)
        if(!validUser){
            return res.json({msg:"username or password is incorrect", user: {}, state: false })
        }
        let studentToken = jwt.sign(
            { username: user.username, student: user.student }, 
            process.env.private_key)

        res.json({msg: "Successfully sign in Student", user: {studentToken, id: user._id , student: user.student, userName: user.username, image: user.image, connection: user.connection, name: user.name, lessons: user.lessons , mainLessons: user.mainLessons}, state: true})
    }
    catch{
        res.json("something went wrong")
    }
})
// Method : Patch
  // add Main lessons
  router.patch("/add-mainLesson/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const { mainLesson,themes,teacher } = req.body
      if(!mainLesson){
        return res.status(200).json({
          state:false,
          msg:"Lesson is not found",
          data:mainLesson
        })
      }
      const updateStudentOne = await Students.findById(id)
      if (updateStudentOne.mainLessons.includes(mainLesson)) {
        return res.status(400).json({
          state:false,
          msg:"Lesson is added before",
          data:mainLesson
        })
      }
      const unLearnedThemes = []
       themes.forEach( j => {
          if(!updateStudentOne.overallLessons.includes(j._id)){
            unLearnedThemes.push(j._id)
          }
        })
     
      const updateStudent = await Students.updateOne(
        {_id: id},
        {
          $set: {
            mainLessons: [...updateStudentOne.mainLessons ,mainLesson],
            overallLessons:[...updateStudentOne.overallLessons,{mainLesson,themes:unLearnedThemes}],
            overallLessonsCount: updateStudentOne.overallLessonsCount + unLearnedThemes.length
          }
        }
      );
      if (updateStudentOne.teachers.includes(teacher)) {
        return    res.json({msg: 'This MainLesson,overallLessonsCount and themes are added ', data: updateStudent, state: true})
       
      }
      const updateStudent2 = await Students.updateOne(
        {_id: id},
        {
          $set: {
            teachers:[...updateStudentOne.teachers,teacher],
          }
        }
      );
     
   
      res.json({msg: 'This MainLesson,teachers ,overallLessonsCount  and themes are added ', data: [updateStudent,updateStudent2], state: true})
    }
    catch(err){
      res.json(err)
    }
  })


  // Method : Patch
  // add theme
  router.patch("/add-theme/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const {lesson } = req.body
      if(!lesson){
        return res.status(200).json({
          state:false,
          msg:"Lesson is not found",
          data:lesson
        })
      }
      const updateStudentOne = await Students.findById(id)
      const updateStudent = await Students.updateOne(
        {_id: id},
        {
          $set: {
            lessons: [...updateStudentOne.lessons ,lesson]
          }
        }
      );
      res.json({msg: 'This Theme is added ', data: updateStudent, state: true})
    }
    catch(err){
      res.json(err)
    }
  })
  
  //Method : Patch
  // Increasee student's themes count that must be learn
  router.patch("/add-theme-count/:id", async(req, res)=>{
    try{
      const {id} = req.params
      
      const updateStudentOne = await Students.findById(id)
      const updateStudent = await Students.updateOne(
        {_id: id},
        {
          $set: {
            overallLessonsCount: updateStudentOne.overallLessonsCount + 1
          }
        }
      );
      res.json({msg: 'This Theme is added ', data: updateStudent, state: true})
    }
    catch(err){
      res.json(err)
    }
  })
  //Method : Patch
  // Decreasee student's themes count that must be learn
  router.patch("/remove-theme-count/:id", async(req, res)=>{
    try{
      const {id} = req.params
      
      const updateStudentOne = await Students.findById(id)
      const updateStudent = await Students.updateOne(
        {_id: id},
        {
          $set: {
            overallLessonsCount: updateStudentOne.overallLessonsCount - 1
          }
        }
      );
      res.json({msg: 'This Theme is added ', data: updateStudent, state: true})
    }
    catch(err){
      res.json(err)
    }
  })

  router.patch("/change-image/:id", async(req, res) => {
    try{
      const {id} = req.params
      const {newImage} = req.body
      if(!newImage){
        return res.json({state:false, msg:"newImage is not found",data:newImage})
      }
      const updateStudent = await Students.updateOne(
        {_id:id},
        {
          $set: {
            image: newImage
          }
        }
      );
      res.json({state:true,msg:"Successfully",data:updateStudent})
    }
    catch(err){
      res.json("smth went wrong ", err)
    }
  })

  // // Method  Patch
  // // add themes that must will learn
  // router.patch("/add-overall-lesson", async(req,res) => {
  //   try{
  //     const {themes} = req.body;
  //     const {studentsId} = req.body;
  //     if (!themes) {
  //       return res.json({
  //         state:false,
  //         msg:"themes are not found",
  //         data:themes
  //       })
  //     }
  //     if (!studentsId) {
  //       return res.json({
  //         state:false,
  //         msg:"Students are not found",
  //         data:studentsId
  //       })
  //     }

  //     const returns = []

  //     studentsId.forEach( id => {
  //       const updateStudentOne = await (Students.findById(id))
  //       // const newestThemes = themes.filter(theme => !updateStudentOne.includes(theme))
        
  //       await (Students.updateOne(
  //         {_id: id},
  //         {
  //           $set: {
  //             overallLessons: [...updateStudentOne.overallLessons,themes]
  //           }
  //         }
  //       ));
  //       // returns.push(updateStudent)
  //     });

  //     res.json({
  //       state:true,
  //       msg:"Successfully",
  //       data:returns
  //     })
  //   }
  //   catch(err){
  //     res.json("smth went wrong ",err)
  //   }
  // })

    // Method Delete
    // Delete Student 
    router.delete("/delete/:id", async(req, res)=>{
      try{
          let deleteStudent = await Students.findByIdAndRemove(req.params.id)
          res.json({msg: "Successfully deleted", teacher: deleteStudent, state: true})
      }   
      catch{
          res.json("something went wrong")
      }
  })


  module.exports = router