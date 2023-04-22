const express = require("express");
const router = express.Router();
const {StudentImages,StudentImagesValidate} = require("../../models/studentImages")
const fs = require("fs");
const cloudinary = require("../../cloudinary");
const uploads = require("../../multer");


router.get("/", async(req,res) => {
    try{
        const images = await StudentImages.find()
        if (!images) {
            return res.json({
                state:false,
                msg:"Images are not found",
                data:images
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:images
        })
    }
    catch(err){
        res.json("smth went wrong ",err)
    }
})

router.post("/", uploads.array("image"), async(req,res) => {
 try{
        const uploader = async (path) => await cloudinary.uploads(path, "studentImages");

        let image = ""
        if (req.files) {
            const files = req.files;
            for (const file of files) {
                const { path } = file;
                const newPath = await uploader(path);
                image = newPath
                fs.unlinkSync(path);
            }
        }
        if (!image) {
            return res.json({
                state:false,
                msg:"Image is not found",
                data:image
            })
        }
        const newImage =await StudentImages.create({image})
        if (!newImage) {
            return res.json({
                state:false,
                msg:"Image is not create ",
                data:newImage
            })
        }

        const savedImage = await newImage.save()
        if (!savedImage) {
            return res.json({
                state:false,
                msg:"Image is not saved",
                data:savedImage
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:savedImage
        })
  }
  catch(err){
    res.json("smth went wrong ",err)
  }


})

module.exports = router;