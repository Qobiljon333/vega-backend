const mongoose = require("mongoose")
const Joi  = require("joi");

const themeSchema = new mongoose.Schema({
    lessonId:{
        type: String,
        required: true
    },
    teacher:{
        type:String,
        required:true
    },
    theme:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    content:{
        type:Array,
        required: true
    },
    task:{
        type:Array,
        required:true
    },
   
    ball:{
        type:Number
    },
    tag:{
        type:Array,
        required:true
    }
})

const Themes = mongoose.model("themes",themeSchema) ;

const themeValidate = (body) => {
    const schema = Joi.object({
        lessonId: Joi.string().required(),
        teacher: Joi.string().required(),
        theme: Joi.string().required(),
        image: Joi.string().required(),
        content: Joi.array().required(),
        task: Joi.array().required().min(3),
        tag: Joi.array().required().min(2),
    })

    return schema.validate(body)
}

exports.Themes = Themes ;
exports.themeValidate = themeValidate;