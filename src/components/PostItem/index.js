import React from 'react'
import moment from 'moment';
import {v4 as uuid} from 'uuid'
import Cookies from 'js-cookie'
import {BsHeart} from 'react-icons/bs'
import {BiShareAlt} from 'react-icons/bi'
import {FcLike} from 'react-icons/fc'
import {FaRegComment, FaShareAlt} from 'react-icons/fa'
import './index.css'

const PostDetails = props => {
  const {eachPostDetails} = props
  const {
    replies,
    dateTime,
    likesCount,
    post,
    postId,
    username,
    likeStatus,
  } = eachPostDetails

  const profilePic = "https://res.cloudinary.com/v45/image/upload/v1691995114/user_lab1ue.png";
  const createdAt = moment(dateTime, "YYYY-MM-DD HH:mm:ss")
  
  const [updateLikeStatus, setUpdatedLikeStatus] = React.useState(likeStatus);
  const [postLikesCount, setPostLikesCount] = React.useState({
    postLikesCount: likesCount,
  })

  const toggleThePostLikeStatus = async ()=>{
    try{
        const token = Cookies.get('csp_app_jwt_token'); 
        const backendApiUrl = process.env.REACT_APP_API_URL 
        if(updateLikeStatus === false){
      
      const likeDetails = {
         postId
      }
      
      const url = `${backendApiUrl}/like-post/`
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
          },
        body: JSON.stringify(likeDetails),
      }

      const response = await fetch(url, options)
       await response.json()  
      // console.log("post liked")
      if(response.ok){
        setUpdatedLikeStatus(true)
        setPostLikesCount(prev=>({
            postLikesCount : prev.postLikesCount + 1
        }))
      }
    }else{
        const url = `${backendApiUrl}/like-post/${postId}`
        const options = {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
            },
        }
  
        const response = await fetch(url, options)
         await response.json()  
        // console.log("post  dis-liked")
        if(response.ok){
          setUpdatedLikeStatus(false)
          setPostLikesCount(prev=>({
              postLikesCount : prev.postLikesCount - 1
          }));

    }
}

}
    catch (e) {
      
      console.log('user posts fetch error', e)
    } 

  }

  /*
  const formattedComments = replies.map(comment => ({
    comment: comment.comment,
    commentedUserId: comment.user_id,
    commentedUserName: comment.user_name,
  }))
  

  const [likeStatus, setLikeStatus] = React.useState(false)
  const [postLikesCount, setPostLikesCount] = React.useState({
    postLikesCount: likesCount,
  })
  // const likeStatus = true
  const postLikeStatus = async () => {
    try {
      const url = `https://apis.ccbp.in/insta-share/posts/${postId}/like`
      const token = Cookies.get('jwt_token')
      const likeObj = {
        like_status: !likeStatus,
      }

      const options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          like_status: !likeStatus,
        }),
      }
      const response = await fetch(url, options)
      const data = await response.json()

      if (response.ok) {
        setLikeStatus(data.message === 'Post has been liked')
        if (data.message === 'Post has been liked') {
          setPostLikesCount(prev => ({
            ...prev,
            postLikesCount: prev.postLikesCount + 1,
          }))
        } else {
          setPostLikesCount(prev => ({
            ...prev,
            postLikesCount: prev.postLikesCount - 1,
          }))
        }
      }
    } catch (e) {
      console.log('like status error', e)
    }
  }

  */
  
  return (
    <li className="post-item-bg-container">
      
        <div className="post-profile-pic-container">
          <img
            className="post-profile-pic"
            alt="post author profile"
            src={profilePic}
          />
          <h1 className="post-creator-name">{username}</h1>
        </div>
      
      <div className='post-text-bg-container'>
      <p className="post-text">{post}</p>
      </div>
      <div className="post-text-card">
        <div className="post-icons-container">
          <button
            
            className="icon-button"
            type="button"
            onClick={toggleThePostLikeStatus}
          >
            {updateLikeStatus === true ? (
              <FcLike className="like-icon" />
            ) : (
              <BsHeart className="like-icon" />
            )}
          </button>
          <button className="icon-button" type="button" >
            <FaRegComment size={24} />
          </button>
          <button className="icon-button" type="button" >
            <BiShareAlt size={24} />
          </button>
        </div>
        <p className="likes-count">{postLikesCount.postLikesCount} {postLikesCount.postLikesCount===1?'like':'likes'}</p>
        
        { replies?.length > 0 &&
        <ul className="comments-list">
          {replies?.map(reply => (
            <li key={uuid()} className="comment-item">
              <p className="comment-text">
                <span className="comment-user">
                  {reply.replied_by}
                </span>{' '}
                {reply.reply}
              </p>
            </li>
          ))}
        </ul>
}
        <p className="time">{createdAt.fromNow()}</p>
      </div>
    </li>
  )
}

export default PostDetails