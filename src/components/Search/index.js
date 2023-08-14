import {Component} from 'react'
import Cookies from 'js-cookie'
import {Link} from 'react-router-dom'
import {apiStatusConstants, PrimaryButton, RenderLoader} from '../Extras'
import PostDetails from '../PostItem'
import Header from '../Header'
import './index.css'

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      apiStatus: apiStatusConstants.initial,
      userPosts: [],
    }
  }

  componentDidMount() {
    this.fetchUserPosts()
  }

  fetchUserPosts = async () => {
    try {
      this.setState({isLoading: true, apiStatus: apiStatusConstants.inProgress})

      const token = Cookies.get('csp_app_jwt_token')
      const {match} = this.props
      let {text} = match.params
      // console.log('text', text)
      if (text === 'undefined') {
        text = ''
      }
      const backendApiUrl = process.env.REACT_APP_API_URL
      const url = `${backendApiUrl}/post?search_q=${text}`
      const options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      }

      const response = await fetch(url, options)
      const data = await response.json()

    
      if (response.ok) {
        const modifiedUserPosts = data?.map(eachPost => ({
          username : eachPost.username,
          post : eachPost.post,
          postId : eachPost.post_id,
          dateTime : eachPost.date_time,
          likesCount : eachPost.likes_count,
          replies : eachPost.replies,
          likeStatus : eachPost.like_status === 0 ? false :true
        }))

        // console.log(modifiedUserPosts)
        // Update user posts in the context
        this.setState({
          isLoading: false,
          userPosts: [...modifiedUserPosts],
          apiStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({isLoading: false, apiStatus: apiStatusConstants.failure})
      }
      
    } catch (e) {
      this.setState({isLoading: false, apiStatus: apiStatusConstants.failure})
      console.log('user posts fetch error', e)
    } finally {
      this.setState({isLoading: false})
    }
  }

  // Render the user stories

  renderUserPosts = () => {
    const {userPosts, isLoading, apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return (
          isLoading && (
            <div className="loader-bg-container">
              <RenderLoader isLoading={isLoading} />
            </div>
          )
        )
      case apiStatusConstants.success:
        return (
          <>
            {userPosts?.length > 0 ? (
              <ul className='user-posts-list-bg-container'>
                {userPosts.map(post=>(
                  <PostDetails key={post.postId} eachPostDetails={post} />
                ))}
              </ul>
            ) : (
              <div className="home-no-posts-view">
                <img
                  className="home-no-posts-view-image"
                  alt="search not found"
                  src="https://res.cloudinary.com/v45/image/upload/v1689575508/instaShareProject/searchNotFoundRoute/Group_w4uaxt.jpg"
                />
                <h1 className="home-no-posts-view-heading">Search Not Found</h1>
                <p className="home-no-posts-view-description">
                  Try different keyword or search again
                </p>
              </div>
            )}
          </>
        )
      case apiStatusConstants.failure:
        return (
          <div className="profile-failure-view-bg-container">
            <img
              className="profile-failure-view-image"
              alt="failure-view"
              src="https://res.cloudinary.com/v45/image/upload/v1690384555/alert-triangle_vzl7rv.jpg"
            />
            <h1 className="profile-failure-view-text">
              Something went wrong. Please try again
            </h1>
            <Link to="/" style={{textDecoration: 'none'}}>
              <PrimaryButton type="button">Try Again</PrimaryButton>
            </Link>
          </div>
        )
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="home-bg-container">
          <h1 className="search-results-heading">Search Results</h1>
          {this.renderUserPosts()}
        </div>
      </>
    )
  }
}

export default Search