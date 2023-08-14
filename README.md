
# Content Sharing Platform - Backend
Welcome to the backend of the Content Sharing Platform project. This backend is built using Express.js and utilizes various packages to provide functionality such as authentication, database operations, and more.

# Getting Started
Follow these instructions to set up and run the backend Express app on your local machine.

# Prerequisites
#### Make sure you have the following software installed:
Node.js (v14 or higher)
npm (Node Package Manager)
# Installation
1) git clone https://github.com/veeru78866/content-sharing-platform-app.git
2) Navigate to the project directory. --> cd content-sharing-platform-backend
3) Install the required packages using npm.--> npm install
# Running the App
    nodemon index.js 
# Available Endpoints
#### 1) getting logged user details
GET http://localhost:3500/user-details <br/>
Authorization: Bearer JWT_TOKEN
##### sample output: 
###
        
    {
      "id": 2,
      "username": "veerendra45",
      "gender": "Male",
      "location": "hyderabad",
      "mobile_number": "9898980001"
    }

#### 2) getting logged user details

    POST http://localhost:3500/users/  <br/>
    Content-Type: application/json  <br/>
    
    {   
        "username":"ramana",
        "password": "2023",
        "gender": "Male",
        "location":"hyderabad",
        "mobile_number": "9898980004"
}
##### sample output: 
###### success response:
  # 
    {
      "success_msg": "User created successfully"
    }
###### error response:
#
        
    {
      "error_msg": "User already exists"
    }

#### 3) user login api
POST http://localhost:3500/login/  <br/>
Content-Type: application/json  <br/>

{
    "username":"veerendra45",
    "password": "2023"
}
##### sample response:
#
    {
      "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZlZXJlbmRyYTQ1IiwiaWF0IjoxNjkyMDM2ODQzfQ.p1LjzEAWp_zK6nwdDJCRSzCIfWQb0evcu87YLjx6UwQ"
    }

#### 4) create a new post on post table
POST  http://localhost:3500/post/  <br/>
Authorization: Bearer JWT_TOKEN  <br/>
Content-Type: application/json  <br/>

{
    "post" : "I LOve My India"
}
#### 5) get all the posts 
GET  http://localhost:3500/post?search_q=  <br/>
Authorization: Bearer JWT_TOKEN  <br/>
##### sample result:
#
    [
      {
        "post_id": 15,
        "post": "Happy Independence Day in Advance",
        "username": "veerendra45",
        "date_time": "2023-08-14 19:28:23",
        "likes_count": 2,
        "replies": null,
        "like_status": 1
      },
      {
    "post_id": 3,
    "post": "Happy Independence Day",
    "username": "veerendra45",
    "date_time": "2023-08-12 11:09:09",
    "likes_count": 4,
    "replies": [
      {
        "reply_id": 2,
        "reply": "Jai Hind!!!",
        "replied_by": "veerendra45",
        "reply_date_time": "2023-08-13 11:33:53"
      },
      {
        "reply_id": 3,
        "reply": "Jai Hind!!!",
        "replied_by": "veerendra45",
        "reply_date_time": "2023-08-13 11:34:22"
      },
      {
        "reply_id": 2,
        "reply": "Jai Hind!!!",
        "replied_by": "veerendra45",
        "reply_date_time": "2023-08-13 11:33:53"
      },
      {
        "reply_id": 3,
        "reply": "Jai Hind!!!",
        "replied_by": "veerendra45",
        "reply_date_time": "2023-08-13 11:34:22"
      }
    ],
        "like_status": 1
     },
      ...
      ]
###
PUT   http://localhost:3500/post/6/  <br/>
Authorization: Bearer JWT_TOKEN  <br/>
Content-Type: application/json  <br/>

{
    "post" : "I LOve My India"
}

###
DELETE   http://localhost:3500/post/6/  <br/>
Authorization: Bearer  <br/>

###
POST  http://localhost:3500/like-post/  <br/>
Authorization: Bearer JWT_TOKEN  <br/>
Content-Type: application/json  <br/>

{
    "postId" : 12
}
###
DELETE   http://localhost:3500/like-post/10/  <br/>
Authorization: Bearer JWT_TOKEN  <br/>

###
POST  http://localhost:3500/reply/  <br/>
Authorization: Bearer  <br/>
Content-Type: application/json  <br/>

{
    "postId" : 3,
    "reply" : "Jai Hind!!!"
}
###
    
    

