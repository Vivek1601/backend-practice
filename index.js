// // console.log("Hello");
// // console.log(400/2);

// // const http = require("http");
// import http from "http";
// // const gfName = require("./features");
// // import gfName from "./features.js"; //or
// // import champakchacha from "./features.js";
// // import { gfName2,gfName3 } from "./features.js";
// // import champakchacha,{gfName2,gfName3} from "./features.js";
// // console.log(champakchacha);
// // console.log(gfName2);
// // console.log(gfName3);

// // import * as myObj from "./features.js";
// // console.log(myObj);
// // console.log(myObj.gfName2);

// import { generateLovePercent } from "./features.js";
// // console.log(generateLovePercent());

// import fs from "fs";
// const home = fs.readFileSync("./index.html")
// // console.log(home);
// // console.log(http);

// // import path from "path";
// // console.log(path.extname("/home/random/index.js"));
// // console.log(path.dirname("/home/random/index.js"));

// const server = http.createServer((req,res)=>{
//     // console.log(req.url);
//     // res.end("<h1>Noice</h1>");

//     //    console.log(req.method);

//     if(req.url === "/"){
//         // res.end("<h1>Home Page</h1>")
//         // console.log(home);
//         // res.end(home)
//         // fs.readFile("./index.html", (err,data) => {
//         //     res.end(data);
//         //  })
//         res.end(home)
//     }else if(req.url === "/about"){
//         // res.end("<h1>About Page</h1>")
//         res.end(`<h1>Love is ${generateLovePercent()}</h1>`)
//     }else if(req.url === "/contact"){
//         res.end("<h1>Contact Page</h1>")
//     }else{
//         res.end("<h1>Page Not Found</h1>")
//     }
// })

// server.listen(5000,()=>{
//     console.log("Server is Working");
// })

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
    dbName : "Backend"
}).then(()=>console.log("Database connected")).catch((e) => {
    console.log(e);
})

// const messageSchema = new mongoose.Schema({
//     name: String,
//     email : String,
// })
// const message = mongoose.model("Message",messageSchema)

// const app = express();

// // Middlewares
// app.use(express.static(path.join(path.resolve(),"public"))); 
// app.use(express.urlencoded({extended : true}));
// app.use(cookieParser());

// const users = [];

// app.get("",(req,res) => {
//     // res.send("Hi")
//     // res.sendStatus(404)app.get("/success",(req,res) => {
//     res.render("success");
//     // res.sendFile("index")
// })
//     // res.sendStatus(500)
//     // res.sendStatus(400)
//     // res.json({
//     //     success : true,
//     //     products : [],
//     // })
//     // res.status(404).json("meri marzi")
//     // console.log(path.resolve());

//     const pathLocation = path.resolve();
//     // console.log(path.join(pathLocation,"index.html"));
//     res.sendFile(path.join(pathLocation,"index.html"))
// })

//setting up view engine
// app.set("view engine", "ejs");

// app.get("/",(req,res) => {
//     res.render("index",{name : "Singh"})
// })

// // app.get("/add",async (req,res) => {
// //     await message.create({name:"Abhi", email:"sample@gmail.com"})
// //         res.send("Nice")
// // })


// // 


// app.get("/success",(req,res) => {
//     res.render("success");
//     // res.sendFile("index")
// })

// app.post("/contact", async (req,res)=> {
//     // // console.log(req.body);
//     // // console.log(req.body.name);

//     // users.push({username: req.body.name, email: req.body.email});
//     // // res.render("success"); //to hit success on same url
//     // res.redirect("/success"); //to hit sucess on different url

//     // const messageData = {name: req.body.name, email : req.body.email}
//     // console.log(messageData);
//     // await message.create(messageData)

//     // await message.create({name: req.body.name, email : req.body.email})
//     // res.redirect("success");

//     const {name,email} = req.body;
//     await message.create({name, email})
//     res.redirect("success");

// })


// app.get("/users",(req,res) => {
//     res.json({
//         users,
//     })
// })

// app.listen(5000, () => {
//     console.log("Server is Working");
// })


const UserSchema = new mongoose.Schema({
    name: String,
    email : String,
    password : String,
})
const User = mongoose.model("User",UserSchema)

const app = express();

// Middlewares
app.use(express.static(path.join(path.resolve(),"public"))); 
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req,res,next) => {
    // console.log(req.cookies);
    const {token} = req.cookies; // req.cookies.token

    if(token){
        const decoded = jwt.verify(token,"hjdfkvkdfd");
        req.user = await User.findById(decoded._id);
        next();
    }else{
        res.redirect("/login")
    }
}
app.get("/",isAuthenticated,(req,res) => {
    // console.log(req.user);
    res.render("logout",{name: req.user.name})
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res) => {
    res.render("register")
})

app.post("/login",async (req,res) => {
    const {email, password} = req.body;

    let user = await User.findOne({email});

    if(!user) return res.redirect("/register");

    // const isMatch = user.password === password;
    console.log(password,user.password);
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch) return res.render("login",{email, message : "Incorrect Password"});

    const token = jwt.sign({_id: user._id},"hjdfkvkdfd")

    res.cookie("token",token,{
        httpOnly:true,     //httponly true is bcoz server side pr hum cookie access kr skte h but not on client side
        expires: new Date(Date.now()+60 * 1000),   
    });
    res.redirect("/");

})


app.post("/register",async (req,res) => {

    // console.log(req.body);
    const {name, email, password} = req.body;

    let user = await User.findOne({email})
        if(user){
            return res.redirect("/login");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

     user = await User.create({
        name,
        email,
        password : hashedPassword,
    });

    const token = jwt.sign({_id: user._id},"hjdfkvkdfd")
    // console.log(token);

    res.cookie("token",token,{
        httpOnly:true,     //httponly true is bcoz server side pr hum cookie access kr skte h but not on client side
        expires: new Date(Date.now()+60 * 1000),   
    });
    res.redirect("/");
})


// app.post("/login",async (req,res) => {

//     // console.log(req.body);
//     const {name, email} = req.body;

//     let user = await User.findOne({email})
//         if(!user){
//             return res.redirect("/register");
//         }
    

//      user = await User.create({
//         name,
//         email,
//     });

//     const token = jwt.sign({_id: user._id},"hjdfkvkdfd")
//     // console.log(token);

//     res.cookie("token",token,{
//         httpOnly:true,     //httponly true is bcoz server side pr hum cookie access kr skte h but not on client side
//         expires: new Date(Date.now()+60 * 1000),   
//     });
//     res.redirect("/");
// })

app.get("/logout",(req,res) => {
    res.cookie("token",null,{
        httpOnly:true,    //httponly true is bcoz server side pr hum cookie access kr skte h but not on client side
        expires: new Date(Date.now()),    
    });
    res.redirect("/");
})

app.listen(5000, () => {
    console.log("Server is Working");
})





