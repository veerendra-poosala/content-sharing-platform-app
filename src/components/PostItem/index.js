import React from 'react'
import { withRouter } from 'react-router-dom/cjs/react-router-dom.min';
import moment from 'moment';
import {v4 as uuid} from 'uuid'
import Cookies from 'js-cookie'
import {BsHeart} from 'react-icons/bs'
import {BiShareAlt,BiDotsVerticalRounded} from 'react-icons/bi'
import {FcLike} from 'react-icons/fc'
import {FaRegComment} from 'react-icons/fa'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import './index.css'

const PostDetails = props => {
  const {eachPostDetails, deletePost} = props
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
  const [editPost, setEditPost] = React.useState({editPost: false});
  const[postText, setPostText] = React.useState(post);

  const toggleEditPost = ()=>{
    setEditPost({
      editPost : true
    })
  }

  const onChangePostText = (e)=>{
    setPostText(e.target.value)
  }

  const updatePostTextGlobally = async(e)=>{
    try{
      
      
        const token = Cookies.get('csp_app_jwt_token');
      if(postText.trim() !== ''){
        // console.log(postText, typeof(postText))
      const postDetails = {
        "post" : String(postText)
      }
      const backendApiUrl = process.env.REACT_APP_API_URL
      const url = `${backendApiUrl}/post/${postId}`
      const options = {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(postDetails),
      }

      
      
      const response = await fetch(url, options)
       await response.json()  
      // console.log("posted message",data)
       
      if(response.ok){
        setEditPost({editPost : false})
      }
    
    } 
  
    }
    catch (e) {
      
      console.log('user posts fetch error', e)
    } finally{
      setEditPost({editPost : false})
    }

  }
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

  React.useEffect(()=>{console.log('')},[editPost]);

  const deletePostByUsingPostId = ()=>{
      deletePost(postId);
  }

  return (
    <li className="post-item-bg-container">
      <div className='post-profile-pic-bg-container'>
        <div className="post-profile-pic-container">
          <img
            className="post-profile-pic"
            alt="post author profile"
            src={profilePic}
          />
          <h1 className="post-creator-name">{username}</h1>
        </div>

        {/* options pop up */}
        <Popup
            menu
            position="bottom right"
            contentStyle={{
              padding: '0px',
              border: 'none',
              width: '100px',
              marginTop: '0px',
              display: 'flex',
              paddingLeft : '4px',
              paddingRight: '0px',
              
              boxSizing: 'border-box',
            }}
            arrow={false}
            trigger={
              <button type="button" className="menu-pop-up-button">
                <BiDotsVerticalRounded />
              </button>
            }
          >
            {close =>{ return(
              <div className='modal-post-item-options'>
                <button type='button' onClick={toggleEditPost} className='post-item-optons-button'>
                    EDIT
                </button>
                <hr style={{height: '1.5px', width: '100%', color: '#000000'}}/>
              
                <button type='button' onClick={deletePostByUsingPostId} className='post-item-optons-button'>
                    DELETE
                </button>
              </div>

            )
            }
            }

          </Popup>
        
        </div>
      <div className='post-text-bg-container'>
        {
          editPost.editPost === false ?
      (<p className="post-text">{postText}</p>) :
      (<textarea className='text-area-element' autoFocus value={postText} onChange={onChangePostText} onBlur={updatePostTextGlobally} ></textarea>)
        }
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

export default withRouter(PostDetails)