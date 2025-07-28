
const { faker } = require('@faker-js/faker');
const mysql=require('mysql2');
const express=require("express");
const bcrypt = require("bcrypt");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
// Load environment variables
require("dotenv").config();

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))
app.use(express.static(path.join(__dirname,"public")));

const connection =mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
console.log("DB User:", process.env.DB_USER);

let getUser=()=>{
    return[
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};
//Home route
app.get("/",(req,res)=>{
    let q= `SELECT count(*) FROM info`;
    
try{
connection.query(q, (err, result)=>{
    if(err) throw err;
    let count =result[0]["count(*)"];
    res.render("home.ejs",{count});
});
}catch(err){
    console.log(err);
    res.send("some error in DB");
}
});

//Show route
app.get("/user",(req,res)=>{
    let q=`SELECT *FROM info`;

    try{
        connection.query(q, (err, users)=>{
    if(err) throw err;
        // res.send(result);
        res.render("showusers.ejs",{users});
    });
    }catch(err){
         console.log(err);
         res.send("some error in DB");
    }
})
//Edit route
app.get("/user/:id/edit", (req,res)=>{
    let {id}=req.params;
    let q= `SELECT *FROM info WHERE id='${id}'`;
        try{
        connection.query(q, (err, result)=>{
    if(err) throw err;
        let user=result[0];
        res.render("edit.ejs",{user});
    });
    }catch(err){
         console.log(err);
         res.send("some error in DB");
    }
});

//Update (DB) route
app.patch("/user/:id", (req,res)=>{
    let {id}=req.params;
    let{password:formPass,username:newUsername}=req.body;
    let q= `SELECT *FROM info WHERE id='${id}'`;
        try{
        connection.query(q, (err, result)=>{
    if(err) throw err;
        let user=result[0];
        if(formPass!=user.password){
            res.send("WRONG password");
        }else{
            let q2=`UPDATE info SET username='${newUsername}' WHERE id='${id}'`;
            connection.query(q2,(err,result)=>{
                if(err) throw err;
                res.redirect("/user");
            });
        }
    });
    }catch(err){
         console.log(err);
         res.send("some error in DB");
    }
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs"); // Assuming your form is in views/new.ejs
});


app.post("/user", (req, res) => {
    let { username, email, password } = req.body;
    let id = faker.string.uuid(); // Generate unique ID
    let q = "INSERT INTO info(id, username, email, password) VALUES (?, ?, ?, ?)";
    try {
        connection.query(q, [id, username, email, password], (err, result) => {
            if (err) throw err;
            res.redirect("/user"); // After insertion, redirect to show page
        });
    } catch (err) {
        console.log(err);
        res.send("Error inserting user data");
    }
});


app.get("/user/search", (req, res) => {
  let { username } = req.query;
  let q = `SELECT * FROM info WHERE username LIKE '%${username}%'`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

// Render delete form
app.get("/user/delete", (req, res) => {
  res.render("delete.ejs"); 
});

//Delete user based on credentials
app.delete("/user/:id", (req, res) => {
  let { email, password } = req.body;

  let q = "SELECT * FROM info WHERE email = ?";
  connection.query(q, [email], (err, result) => {
    if (err) return res.send("Database error");
    if (result.length === 0) return res.send("User not found");

    let user = result[0];
    if (user.password !== password) return res.send("Incorrect password");

    let deleteQuery = "DELETE FROM info WHERE email = ?";
    connection.query(deleteQuery, [email], (err) => {
      if (err) return res.send("Error deleting user");
      console.log(user);
      res.redirect("/user");
    });
  });
});


app.listen("8080", ()=>{
    console.log("server is listening to port 8080");
});

