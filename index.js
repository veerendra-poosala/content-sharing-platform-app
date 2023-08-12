// importing all the required modules and third party packages
const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { format } = require('date-fns');

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

//creating new post 
app.post('/post/',authenticateToken, async (request, response)=>{
    try{
        const {post} = request.body;
        const username = request.username
        const selectUserQuery = `
            SELECT * FROM user where username = '${username}';
        `;
        const userDetails = await db.get(selectUserQuery);
        const userId = userDetails.id;
        const formattedDateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        
        const createPostQuery = `
            INSERT INTO 
                post (post, user_id, date_time)
            VALUES
                ('${post}',
                ${userId},
                '${formattedDateTime}'
                );
        `;
        await db.run(createPostQuery);
        response.status(201)
        response.send("post created successfully");
    }catch(e){
        console.log(`Error when creating post ${e.message}`);
    }
});

// getting posts list
app.get('/post/',authenticateToken, async(request, response)=>{
    try{
        const {
            search_q = ""
        } = request.query
        const getAllPostsQuery = `
            SELECT * FROM post
            WHERE UPPER(post) LIKE UPPER('%${search_q}%');
        `;
        const dbObject = await db.all(getAllPostsQuery);

        response.send(dbObject);

    }catch(e){
        console.log(`Error When getting the posts list: ${e.message}`);
    }
});

// updating post 
app.put('/post/:postId/', authenticateToken, async(request, response)=>{
    try{
        const {post} = request.body;
        const {postId} = request.params
        const updateSelectedPostQuery = `
            UPDATE post SET post = '${post}' WHERE post_id = ${postId};
        `;
        await db.run(updateSelectedPostQuery);
        response.send("Post updated successfully")
    }catch(e){
        console.log(`Error when updating the post: ${e.message}`);
    }
});

// deleting post
app.delete('/post/:postId/', authenticateToken, async(request, response)=>{
    try{
        const {postId} = request.params
        const deleteSelectedPostQuery = `
            DELETE FROM post WHERE post_id = ${postId};
        `;
        await db.run(deleteSelectedPostQuery);
        response.send("Post deleted successfully")
    }catch(e){
        console.log(`Error when updating the post: ${e.message}`);
    }
});

// creating new like
app.post('/like-post/',authenticateToken, async(request ,response)=>{
    try{
        const {postId} = request.body;
        const username = request.username;
        const selectUserQuery = `
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        const userId = dbUser.id;
        const formattedDateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        
        //checking is user is already liked the post
        const getSelectedLikeQuery = `
            SELECT * FROM like WHERE user_id = ${userId} AND post_id = ${postId};
        `;
        const isUserLikedAlready = await db.get(getSelectedLikeQuery);
        // console.log(isUserLikedAlready);
        if(isUserLikedAlready === undefined){
        const createLikePostQuery = `
            INSERT INTO 
                like (post_id, user_id, date_time)
            VALUES
                (
                    ${postId},
                    ${userId},
                    '${formattedDateTime}'
                );
        `;
        await db.run(createLikePostQuery);
        response.status(201);
        response.send('Post Liked Successfully');
                }else{
                    response.status(400);
                    response.send('Post Already Liked');
                }
       
    }catch(e){
        console.log(`Error when liking the post: ${e.message}`);
    }
});

// deleting a like 
app.delete('/like-post/:likeId/', authenticateToken, async(request, response)=>{
    try{
        const {likeId} = request.params
        const deleteSelectedLikeQuery = `
            DELETE FROM like WHERE like_id = ${likeId};
        `;
        await db.run(deleteSelectedLikeQuery);
        response.send("Like deleted successfully")
    }catch(e){
        console.log(`Error when updating the post: ${e.message}`);
    }
});

//creating new reply
app.post('/reply/',authenticateToken, async (request, response)=>{
    try{
        const {reply, postId} = request.body;
        const username = request.username
        const selectUserQuery = `
            SELECT * FROM user where username = '${username}';
        `;
        const userDetails = await db.get(selectUserQuery);
        const userId = userDetails.id;
        const formattedDateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        
        const createReplyQuery = `
            INSERT INTO 
                reply (post_id, reply ,user_id, date_time)
            VALUES
                (${postId},
                    '${reply}',
                ${userId},
                '${formattedDateTime}'
                );
        `;
        await db.run(createReplyQuery);
        response.status(201)
        response.send("reply created successfully");
    }catch(e){
        console.log(`Error when creating reply ${e.message}`);
    }
});

//exporting app
module.exports = app