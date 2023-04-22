const express = require("express");
const router = express.Router();
const {Subjects,subjectValidate} = require("../../models/subjectSchema")
const auth = require("../../middleware/auth")


router.get("/",async(req,res) =>{
    try{
        const subjects = await Subjects.find()
        if (!subjects.length) {
            return res.json({
                state:false,
                msg:"subjects are not found",
                data:subjects
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:subjects
        })
    }
    catch(err){
        res.json("smth went wrong ",err)
    }
})

// auth,
router.post("/", async(req, res) => {
    try{
        const {error} = subjectValidate(req.body)
        if(error){
            return res.json({msg:error.details[0].message, data: [], state: false })
        }

        const {subject} = req.body
        if (!subject) {
            return res.json({
                state:false,
                msg:"subject is ot found",
                data:subject
            })
        }
        const availableSubject = await Subjects.findOne({subject})
        if (availableSubject) {
            return res.json({
                state:false,
                msg:"Subject was been declared",
                data:availableSubject
            })
        }
        const newSubject = await Subjects.create({subject})

        if (!newSubject) {
            return res.json({
                state:false,
                msg:"subject is not create",
                data:newSubject
            })
        }

        const savedSubject = await newSubject.save()
        if (!savedSubject) {
            return res.json({
                state:false,
                msg:"subject is not saved",
                data:savedSubject
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:savedSubject
        })

    }
    catch(err){
        res.json("smth went wrong ",err)
    }
})


module.exports = router