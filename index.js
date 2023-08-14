// importing all the required modules and third party packages
const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { format } = require('date-fns');
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require("path")

// creating an instance for express
const app = express();

// middlewares
app.use(cors());
app.use(express.json()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


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
      response.send({"error_msg":"Invalid JWT Token"});
    } else {
      jwt.verify(jwtToken, "SET_PRODUCTION_SECRET_KEY_HERE", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send({"error_msg":"Invalid JWT Token"});
        } else {
          request.username = payload.username;
          next();
        }
      });
    }
  };

app.get('/', authenticateToken,async(request,response)=>{
    response.send({"success_msg":"Server running successfully"})
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
            response.send({"success_msg":"User created successfully"});

        }else{
            response.status(400);
            response.send({"error_msg":"User already exists"});
        }
        

    }catch(e){
        console.log(`Error While Registering the User ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
    }
});

// creating an api for login 
app.post('/login', async(request, response)=>{
    try{
        const {username, password} = request.body;
        // console.log(username,password, request.body)
        const selectUserQuery =`
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        
        if (dbUser === undefined){
            response.status(400);
            response.send({"error_msg":'Invalid Username'});
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
                response.send({"error_msg":'Invalid Password'});
            }

        }

    }catch(e){
        console.log(`Error when login ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
    }
});

// getting logged user details 
app.get('/user-details', authenticateToken, async(request, response)=>{
    try{
        const username = request.username;
        const selectUserQuery = `
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        const modifiedDbObject = {
            "id" : dbUser.id,
            "username" : dbUser.username,
            "gender" : dbUser.gender,
            "location" : dbUser.location,
            "mobile_number" : dbUser.mobile_number
        }
        response.send(modifiedDbObject)

    }catch(e){
        console.log(`Error when login ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});     
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
        response.send({"success_msg":"post created successfully"});
    }catch(e){
        console.log(`Error when creating post ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
    }
});


// getting posts list
app.get('/post/', authenticateToken, async (request, response) => {
    try {
        const { search_q = "" } = request.query;
        
        // Getting user data
        const username = request.username;
        const selectUserQuery = `
            SELECT id FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        const userId = dbUser.id;
        
        // Getting all the posts data
        const getAllPostsQuery = `
            SELECT 
                post.post_id as post_id,
                post.post as post,
                user.username as username,
                post.date_time as date_time,
                COUNT(like.post_id) as likes_count,
                '[' || GROUP_CONCAT('{"reply_id": ' || reply.reply_id || ', "reply": "' || reply.reply || '", "replied_by": "' || u.username || '" ,"reply_date_time": "' || reply.date_time || '"}') || ']' as replies,
                CASE WHEN liked.user_id IS NOT NULL THEN 1 ELSE 0 END as like_status
            FROM 
                post 
            INNER JOIN 
                user 
            ON post.user_id = user.id
            LEFT JOIN 
                like
            ON post.post_id = like.post_id
            LEFT JOIN 
                reply
            ON post.post_id = reply.post_id
            LEFT JOIN
                user AS u
            ON reply.user_id = u.id
            LEFT JOIN
                (
                    SELECT post_id, user_id
                    FROM like
                    WHERE user_id = ${userId}
                ) AS liked
            ON post.post_id = liked.post_id
            WHERE UPPER(post.post) LIKE UPPER('%${search_q}%')
            GROUP BY 
                post.post_id, post.post, user.username, post.date_time
            ORDER BY 
                date_time DESC;
        `;
        
        const dbObject = await db.all(getAllPostsQuery);
        
        dbObject.forEach(post => {
            post.replies = JSON.parse(post.replies);
        });
        
        response.send(dbObject);
    } catch (e) {
        console.log(`Error When getting the posts list: ${e.message}`);
        response.status(500);
        response.send({ "error_msg": "Internal Server Error" });
    }
});


// updating post 
app.put('/post/:postId/', authenticateToken, async(request, response)=>{
    try{
        const {post} = request.body;
        const {postId} = request.params
        const username = request.username;
        const selectUserQuery = `
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        // console.log(dbUser.id)
        const updateSelectedPostQuery = `
            UPDATE post SET post = '${post}' WHERE post_id = ${postId} AND user_id=${dbUser.id};
        `;
        const dbResponse = await db.run(updateSelectedPostQuery);
       if(dbResponse?.changes === 1){
        response.send({"success_msg":"Post updated successfully"})
       }else{
        response.status(400);
        response.send({error_msg: 'Only Authorized can edit'})
       }
    }catch(e){
        console.log(`Error when updating the post: ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
    }
});

// deleting post
app.delete('/post/:postId/', authenticateToken, async(request, response)=>{
    try{
        const {postId} = request.params
        const username = request.username;
        const selectUserQuery = `
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        const deleteSelectedPostQuery = `
            DELETE FROM post WHERE post_id = ${postId} AND user_id=${dbUser.id};
        `;
       
        const dbResponse = await db.run(deleteSelectedPostQuery);
        console.log(dbResponse)
       if(dbResponse?.changes === 1){
        response.send({"success_msg":"Post deleted successfully"})
       }else{
        response.status(400);
        response.send({error_msg: 'Only Authorized can delete the post'})
       }
       
    }catch(e){
        console.log(`Error when updating the post: ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
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
        response.send({"success_msg":'Post Liked Successfully'});
                }else{
                    response.status(400);
                    response.send({"error_msg":'Post Already Liked'});
                }
       
    }catch(e){
        console.log(`Error when liking the post: ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
    }
});

// deleting a like 
app.delete('/like-post/:postId/', authenticateToken, async(request, response)=>{
    try{
        const {postId} = request.params
        const username = request.username;
        const selectUserQuery = `
            SELECT * FROM user WHERE username = '${username}';
        `;
        const dbUser = await db.get(selectUserQuery);
        const userId = dbUser.id;
        const deleteSelectedLikeQuery = `
            DELETE FROM like WHERE post_id = ${postId} AND user_id = ${userId};
        `;
        await db.run(deleteSelectedLikeQuery);
        response.send({"success_msg":"Like deleted successfully"})
    }catch(e){
        console.log(`Error when updating the post: ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
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
        response.send({"success_msg":"reply created successfully"});
    }catch(e){
        console.log(`Error when creating reply ${e.message}`);
        response.status(500);
        response.send({"error_msg":"Internal Server Error"});
    }
});

//exporting app
module.exports = app