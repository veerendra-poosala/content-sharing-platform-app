import {Link, withRouter, useLocation} from 'react-router-dom'
import {useState, useEffect} from 'react'
import Cookies from 'js-cookie'
import {FaSearch} from 'react-icons/fa'
import {FiMenu} from 'react-icons/fi'
import {AiFillCloseCircle} from 'react-icons/ai'

import './index.css'

import {PrimaryButton} from '../Extras'

const menuOptions = {
  home: 'Home',
  profile: 'Profile',
  search: 'Search',
}

const Header = props => {

  const location = useLocation()
  const [searchInput, setSearchInput] = useState('')
  const [activeOption, setActiveOption] = useState('')
  
  let defaultMenuOption ;
   switch (location.pathname) {
    case '/':
     defaultMenuOption = menuOptions.home
      break;
      case '/my-profile':
     defaultMenuOption = menuOptions.profile
      break;
      
  
    default:
      defaultMenuOption = menuOptions.search
      break;
  }
  const [modalMenuOptions, setModalMenuOptions] = useState(
    defaultMenuOption
    //location.pathname === '/' ? menuOptions.home : menuOptions.profile,
  )
  const [toggleSmallNavbar, setToggleSmallNavbar] = useState({
    toggleSmallNavbar: false,
  })

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const [userDetails, setUserDetails] = useState('');


  const logout = () => {
    Cookies.remove('csp_app_jwt_token')
    const {history} = props
    history.replace('/login')
  }

  const getUserDetails = async()=>{
    try{
      const token = Cookies.get('csp_app_jwt_token'); 
        const backendApiUrl = process.env.REACT_APP_API_URL 
        const url = `${backendApiUrl}/user-details/`
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
          }
      }

      const response = await fetch(url, options)
      const data = await response.json()  
      // console.log("user data",data)
      setUserDetails(data)

    }catch(e){
      console.log('user posts fetch error', e)
    }
  }

  useEffect(()=>{
    getUserDetails()
  },[])
 

  
  const onChangeSearchCaption = event => {
    setSearchInput(event.target.value)
  }

  const onClickSetActiveOption = event => {
    const selectedOption = event.target.textContent
    setActiveOption(selectedOption)
  }

  const navToSearch = () => {
    const text = searchInput
    setSearchInput('')
    const {history} = props
    if (text === '') {
      return history.push('/search/undefined')
    }
    return history.push(`/search/${text}`)
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/') {
      setActiveOption(menuOptions.home)
    } else if (path === '/my-profile') {
      setActiveOption(menuOptions.profile)
    } else {
      setActiveOption('')
    }
  }, [location.pathname])

  useEffect(() => {
    // Function to update window width state
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }

    // Event listener to update window width on resize
    window.addEventListener('resize', updateWindowWidth)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateWindowWidth)
    }
  }, [])

  return (
    <nav className="header-nav-bg-container">
      <div className="header-nav-container">
        <div className="website-logo-container">
          <Link to="/" className="link-container">
            <img
              className="header-website-logo"
              alt="website logo"
              src="https://res.cloudinary.com/v45/image/upload/v1689618508/Standard_Collection_8_1_gev4v9.png"
            />
            <h1 className="header-website-name">Content Sharing Platform</h1>
          </Link>
        </div>
        <div className="header-options-bg-container">
          <ul className="options-list-for-large-devices">
            <li className="option-item-container search-element-container">
              <input
                type="search"
                className="search-input-element"
                placeholder="Search Post"
                value={searchInput}
                onChange={onChangeSearchCaption}
              />

              <button
                className="search-button"
                data-testid="searchIcon"
                type="button"
                onClick={navToSearch}
              >
                <FaSearch className="search-icon" />
              </button>
            </li>
            <li className="option-item-container">
              <Link
                onClick={onClickSetActiveOption}
                className="link-container"
                to="/"
              >
                <p
                  className={
                    activeOption === menuOptions.home
                      ? 'option-text active-option'
                      : 'option-text'
                  }
                >
                  Home
                </p>
              </Link>
            </li>
            <li className="option-item-container">
              <Link
                onClick={onClickSetActiveOption}
                className="link-container"
                to="/my-profile"
              >
                <p
                  className={
                    activeOption === menuOptions.profile
                      ? 'option-text active-option'
                      : 'option-text'
                  }
                >
                  {userDetails === '' ?menuOptions.profile: userDetails.username}
                </p>
              </Link>
            </li>
            <li className="option-item-container">
              <PrimaryButton
                type="button"
                className="header-logout-button"
                actionOnClick={logout}
              >
                Logout
              </PrimaryButton>
            </li>
          </ul>
          <div className="options-list-for-small-device">
            <button
              type="button"
              onClick={async () => {
                await setToggleSmallNavbar(prev => ({
                  ...prev,
                  toggleSmallNavbar: !prev.toggleSmallNavbar,
                }))
              }}
              className="menu-pop-up-button"
            >
              <FiMenu className="menu-icon" />
            </button>
          </div>
        </div>
      </div>
      {toggleSmallNavbar.toggleSmallNavbar === true && windowWidth <= 768 ? (
        <div className="modal-bg-container">
          <ul className="modal-options-container">
            <li className="option-item-container">
              <Link
                onClick={() => {
                  setModalMenuOptions(menuOptions.home)
                }}
                className="link-container"
                to="/"
              >
                <p
                  className={
                    modalMenuOptions === menuOptions.home
                      ? 'option-text active-option'
                      : 'option-text'
                  }
                >
                  Home
                </p>
              </Link>
            </li>
            <li
              className="option-item-container"
              onClick={() => {
                setModalMenuOptions(menuOptions.search)
              }}
            >
              <p
                className={
                  modalMenuOptions === menuOptions.search
                    ? 'option-text active-option'
                    : 'option-text'
                }
              >
                {menuOptions.search}
              </p>
            </li>
            <li className="option-item-container">
              <Link
                onClick={() => {
                  setModalMenuOptions(menuOptions.profile)
                }}
                className="link-container"
                to="/my-profile"
              >
                <p
                  className={
                    modalMenuOptions === menuOptions.profile
                      ? 'option-text active-option'
                      : 'option-text'
                  }
                >
                  {userDetails === '' ?menuOptions.profile: userDetails.username}
                </p>
              </Link>
            </li>
            <li className="option-item-container">
              <PrimaryButton
                type="button"
                className="header-logout-button"
                actionOnClick={logout}
                style={{height: '30px'}}
              >
                Logout
              </PrimaryButton>
            </li>
            <li className="option-item-container">
              <button
                type="button"
                onClick={async () => {
                  await setToggleSmallNavbar(prev => ({
                    ...prev,
                    toggleSmallNavbar: !prev.toggleSmallNavbar,
                  }))
                }}
                className="close-button"
              >
                <AiFillCloseCircle size="30px" />
              </button>
            </li>
          </ul>
          {modalMenuOptions === menuOptions.search && (
            <div className="option-item-container search-mini-width search-element-container">
              <input
                type="search"
                className="search-input-element"
                placeholder="Search Caption"
                value={searchInput}
                onChange={onChangeSearchCaption}
              />
              <Link
                className="link-container search-link-container"
                to={`/search/${searchInput}`}
              >
                <button
                  data-testid="searchIcon"
                  className="search-button"
                  type="button"
                >
                  <FaSearch className="search-icon" />
                </button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        ''
      )}
    </nav>
  )
}

export default withRouter(Header)