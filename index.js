// importing all the required modules and third party packages
const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const path = require("path")

// creating an instance for express
const app = express();

// middlewares
app.use(express.json()); 

const dbPath = path.join(__dirname,"contentSharingPlatform.db")
let db = null 

const initializeDbAndConnectToServer = async ()=>{
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database,
        });
        app.listen(3500,()=>{
            console.log('server running on  http://localhost:3500/')
        })
    }catch(e){
        console.log(`DB error: ${e.message}`)
        process.exit(1);
    }
}
initializeDbAndConnectToServer();

//creating middleware for authentication
const authenticateToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "SET_PRODUCTION_SECRET_KEY_HERE", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          request.username = payload.username;
          next();
        }
      });
    }
  };

app.get('/', authenticateToken,async(request,response)=>{
    response.send("Server running successfully")
});

//creating an api for user registration

app.post('/users', async(request,response)=>{
    try{
        const {username, password, gender, location, mobile_number} = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const selectUserQuery = `
        SELECT *
         FROM user 
         WHERE 
         username = '${username}' OR mobile_number = '${mobile_number}'; `;
        const dbUser = await db.get(selectUserQuery);
        // console.log(dbUser);
        if (dbUser === undefined){
            
            const createUserQuery = `
                INSERT INTO 
                    user (username, password, gender, location,mobile_number)
                VALUES (
                    '${username}',
                    '${hashedPassword}',
                    '${gender}',
                    '${location}',
                    '${mobile_number}'
                );
            `;
            await db.run(createUserQuery);
            response.send("User created successfully");

        }else{
            response.status(400);
            response.send("User already exists");
        }
        

    }catch(e){
        response.status(400);
        console.log(`Error While Registering the User ${e.message}`);
    }
});

// creating an api for login 

app.post('/login', async(request, response)=>{
    try{
        const {username, password} = request.body;
        const selectUserQuery =`
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        
        if (dbUser === undefined){
            response.status(400);
            response.send('Invalid User');
        }else{
            const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
            if(isPasswordMatched === true){
                const payload = {
                    "username":username,
                }
                const jwtToken = jwt.sign(payload, "SET_PRODUCTION_SECRET_KEY_HERE");
                response.send({ jwtToken });

            }else{
                response.status(400);
                response.send('Invalid Password');
            }

        }

    }catch(e){
        console.log(`Error when login ${e.message}`);
    }
});




module.exports = app