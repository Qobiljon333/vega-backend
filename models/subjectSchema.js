const mongoose = require("mongoose")
const Joi = require("joi")


const subjectSchema = new mongoose.Schema({
    subject:String
})

const Subjects = mongoose.model("subjects",subjectSchema)

const subjectValidate = (body) => {
    const schema = Joi.object({
        subject : Joi.string().required()
    })
    return schema.validate(body)
}

exports.Subjects = Subjects
exports.subjectValidate = subjectValidate