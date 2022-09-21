const express = require('express')
const app = express()
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const bodyParser = require('body-parser');
 
 
//use express static folder
app.use(cors());
app.use(express.static("./public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "nico",
    password: "12345",
    database: "memerator"
})
 
db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
 
//! Use of Multer
let storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.originalname.replace(/ /g, ""))
    }
})
 
let upload = multer({
    storage: storage
});
 
//@type   POST
//route for post image
app.post("/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {
        const imgsrc = req.file.originalname;
        const source = imgsrc.replace(/ /g, "");
        console.log(source)
        const insertData = "INSERT INTO user_images(image_src)VALUES(?)"
        db.query(insertData, [source], (err, result) => {
            if (err) {
                res.sendStatus(400)
                throw new Error('File not uploaded')
                
            }
            console.log("file uploaded")
            return res.sendStatus(201)
        })
    }
});
 
//@type   GET
//route for retrieving image data
app.get("/upload/:originalname", (req, res) => {
   const originalname = req.params.originalname;
   const imagename = originalname.replace(/ /g, "");

   const getSource = `SELECT image_src FROM user_images WHERE image_src = '${imagename}'`
        console.log(getSource)
        db.query(getSource, (err, result) => {
            if (err) {
                res.sendStatus(400)
                throw new Error('File not uploaded')
                
            } else {
                const filePath = `/public/images/${result[0].image_src}`
                console.log('image sent')
                return res.sendFile(__dirname + filePath);
            }
            
        
        })
        return true;

});


 
//create connection
const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`))