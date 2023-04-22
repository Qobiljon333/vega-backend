const express = require("express")
const router = express.Router()
const {Themes,themeValidate} = require("../../models/themaSchema")

// method : Get
// see more
router.get("/see-more/:count", async(req,res) => {
    try{
        const {count} = req.params

        const themes = await Themes.find().limit(count)
        
        if(!themes.length){
            return res.json({
                state:false,
                msg:"Nothing found",
                data: themes
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:themes
        })
    }
    catch(err){
        res.json("smth went wrong",err)
    }
})

// Method : Get
// get themes belong to 1 lesson
router.get("/special/:id", async(req,res) => {
    try{
        const {id} = req.params
        if(!id){
           return  res.json({
                state:false,
                msg:"Id is not found",
                data:[]
            })
        }

        const themes = await (await Themes.find()).filter(theme => theme.lessonId === id)
        if(!themes.length){
            return  res.status(404).json({
                state:false,
                msg: "themes are not found",
                data:themes
            })
        }


        res.json({
            state:true,
            msg:"Successfully",
            data:themes
        })
    }catch(err){
        res.json("smth went wrong",err)
    }
})

// Method : Get
// Get 1 theme
router.get("/:id", async (req,res) => {
    try{
        const {id} = req.params
        if(!id){
            return res.json({
                state:false,
                msg:"id is not found",
                data:[]
            })
        }

        const singleTheme = await Themes.findById(id);
        if(!singleTheme){
            return res.status(404).json({
                state:false,
                msg:"Theme is not found",
                data:singleTheme
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:singleTheme
        })
    }
    catch(err){
        res.json("snth went wrong",err)
    }
})

// Method : Get /
// Search by tags
router.get("/search/:searchText", async(req, res) => {
    try{
        const {searchText} = req.params
        
        const themes = await (await Themes.find()).filter(theme => theme.theme.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) || theme.teacher.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) || theme.tag.includes(searchText.toLocaleLowerCase()))
        if(!themes.length){
            return res.status(404).json({
                state:false,
                msg:"Themes are not found",
                data: themes
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:themes
        })
   
    }
    catch(err){
        res.json("smth went wrong", err)
    }
})


// Method : post
// create new theme 
router.post("/create", async (req,res)=> {
    try{
        const {error} = themeValidate(req.body)
        if(error){
            return res.json({msg:error.details[0].message, data:[], state: false })
        }

        const { lessonId, teacher,theme, content, task, tag, image,} = req.body

        const newTheme = await Themes.create({lessonId, teacher,theme, content, task, tag, image});
        if(!newTheme){
            return res.json({state:false, msg:"couldn't create", data:newTheme});
        }

        const savedTheme = await newTheme.save();
        if(!savedTheme){
            return res.json({state:false, msg:"couldn't save", data:savedTheme});
        }

        res.json({state:true, msg:"Successfully", data:savedTheme});

    }catch(err){
        res.json("smth went wrong",err)
    }
})

// Method : put
// Update theme by id (params)
router.put("/:id", async(req, res) => {
    try{
        const {id} = req.params

        const themeUpdated = await Themes.findByIdAndUpdate(id, req.body);
        if(!themeUpdated){
            return  res.status(404).json({
                state:false,
                msg:"Theme is not found",
                data:themeUpdated
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:themeUpdated
        })

    }catch(err){
        res.json("smth went wrong",err)
    }
})

// Method delete 
// dalete theme by id (params)
router.delete("/:id", async(req, res) => {
    try{
        const {id} = req.params

        const themedeleted = await Themes.findByIdAndDelete(id)
        if(!themedeleted){
            return  res.status(404).json({
                state:false,
                msg:"theme is not found",
                data:themedeleted
            })
        }

        res.json({
            state:true,
            msg:"Successfully",
            data:themedeleted
        })

    }
    catch(err){
        res.json("smth went wrong",err)
    }
})

// Method : Patch
// add comment
router.patch("/add-comment/:id", async(req, res)=>{
    try{
      const {id} = req.params
      const { comment } = req.body
      if(!comment){
        return res.status(200).json({
          state:false,
          msg:"Comment is not found",
          data:comment
        })
      }
      const updateThemeOne = await Themes.findById(id)
      const updateTheme = await Themes.updateOne(
        {_id: id},
        {
          $set: {
            comments: [...updateThemeOne.comments ,comment ]
          }
        }
      );
      
      res.json({msg: 'This Comment is added', data: updateTheme, state: true})
    }
    catch(err){
      res.json(err)
    }
  })





module.exports = router;