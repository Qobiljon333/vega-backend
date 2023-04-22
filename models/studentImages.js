const mongoose = require("mongoose");
const Joi = require("joi");

const studentImagesSchema = new mongoose.Schema({
    image:String
})

const StudentImages = mongoose.model("studentImages",studentImagesSchema)

const StudentImagesValidate = (body) => {
    const schema =Joi.object({
        image: Joi.string().required()
    })

    return schema.validate(body)
}

exports.StudentImages = StudentImages
exports.StudentImagesValidate = StudentImagesValidate