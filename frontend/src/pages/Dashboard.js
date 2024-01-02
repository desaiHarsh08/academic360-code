import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import appLogo from '../assets/app_logo.png'
import { Link } from 'react-router-dom'
import { RxDashboard } from 'react-icons/rx'
import { VscAdd } from 'react-icons/vsc'
import { AiOutlineSearch } from 'react-icons/ai'
import { RiDeleteBinLine } from 'react-icons/ri'
import { RiLogoutBoxLine } from 'react-icons/ri'
import { FiSettings } from 'react-icons/fi'
import { TbReportSearch } from 'react-icons/tb'




const Dashboard = () => {

  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);

  let location = useLocation();

  let navigate = useNavigate();

  const authToken = localStorage.getItem('auth-token');
  const menues = localStorage.getItem('menues');

  // Return to home page for invalid access
  useEffect(() => {
    if (!authToken) {
      navigate('/', { replace: true });
    }
    // console.log(menues)
  }, []);



  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  }

  const handleProfile = () => {
    // const popupMenu = document.getElementById('popup-menu');
    // popupMenu.classList.toggle('hidden');
    // popupMenu.classList.toggle('flex');
    navigate('/settings', { replace: true });

  }

  const handleHmbrg = () => {
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');

    const left = document.getElementById('left');

    bar1.classList.toggle('translate-y-2');
    bar1.classList.toggle('rotate-45');
    bar2.classList.toggle('invisible');
    bar3.classList.toggle('-translate-y-2');
    bar3.classList.toggle('-rotate-45');

    left.classList.add('top-[63px]');
    left.classList.remove('top-0');
    left.classList.toggle('-translate-x-[1000px]');

  }

  window.addEventListener('resize', (e) => {
    const left = document.getElementById('left');
    if (window.innerWidth > 767 && left!==null) {
      left.classList.remove('top-[63px]');
      left.classList.add('top-0');
    }
  })


  return (
    <>
      {/* Loading bar */}
      {loading ? <Loading /> : ''}

      {/* Dashboard */}
      <div id="dashboard" className='w-full h-screen overflow-hidden  '>
        {/* Navbar */}
        <div id="navbar" className='w-full shadow-md p-2 border flex justify-between items-center'>
          <div className="left flex">
            {/* Hamburger */}
            <div id="hmbrg" className='block md:hidden' onClick={handleHmbrg}>
              <div id="bar1" className='w-7 h-1 bg-purple-700 rounded-md transition-all'></div>
              <div id="bar2" className='w-7 h-1 bg-purple-700 rounded-md my-1 '></div>
              <div id="bar3" className='w-7 h-1 bg-purple-700 rounded-md transition-all '></div>
            </div>
            <div className='block md:hidden'>
              <span className='mx-2 text-purple-700 font-medium'>Academic 360</span>
            </div>

            {/* User name */}
            <div className='hidden md:block'>
              <span className='text-xl text-purple-600 font-medium'>{localStorage.getItem('name')}</span>
            </div>
          </div>
          <div className="right cursor-pointer " onClick={handleProfile}>
            {/* Profile */}
            <img src={localStorage.getItem('picture')} alt="img" className='border rounded-full h-12 w-12' />

            {/* Popup menu */}
            <div id='popup-menu' className='absolute z-10 right-2 md:top-[70px] border shadow-lg bg-white text-black w-40 h-20 hidden flex-column justify-center items-center '>
              <Link to={"settings"} className='flex gap-1 items-center'>
                <FiSettings />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Container */}
        <div id="dashboard-container" className='w-full h-full flex '>
          <div id='left' className="left bg-slate-700 text-white top-0 transition-all bottom-0 md:h-full w-3/4 -translate-x-[1000px] md:translate-x-[0px] md:w-[20%] lg:w-[17%] px-1 py-7 absolute md:relative">
            {/* App Logo */}
            <div className='flex justify-center items-center'>
              <div id="logo-container" className='bg-white text-black py-3 m-1 rounded-xl w-[75%]'>
                <div id='logo' className='flex justify-center'>
                  <img src={appLogo} alt="app-logo" className='h-[30%] w-[30%] ' />
                </div>
                <div id='app-name' className='flex justify-center my-3 text-[18px] font-medium w-full'><span className='block'>Academic 360</span></div>
              </div>
            </div>

            {/* Links */}
            <div className='flex justify-center mt-32'>
              <ul className=' flex flex-col'>
                {menues.includes("dashboard")? <li className={`m-1 hover:text-[#00ffff] ${location.pathname.endsWith('/dashboard') ? 'active' : ''}`}>
                  <Link to={""} className='text-[18px] flex items-center gap-2 font-medium'>
                    <RxDashboard />
                    <span>Dashboard</span>
                  </Link>
                </li>: ''}
                {menues.includes("add")? <li className={`m-1 hover:text-[#00ffff] ${location.pathname.endsWith('/add') ? 'active' : ''}`}>
                  <Link to={"add"} className='text-[18px] flex items-center gap-2 font-medium'>
                    <VscAdd className='font-medium text-white' style={{ color: 'white' }} />
                    <span>Add student</span>
                  </Link>
                </li>: ''}
                {menues.includes("delete")?<li className={`m-1 hover:text-[#00ffff] ${location.pathname.endsWith('/delete') ? 'active' : ''}`}>
                  <Link to={"delete"} className='text-[18px] flex items-center gap-2 font-medium'>
                    <RiDeleteBinLine className='font-medium text-white' style={{ color: 'white' }} />
                    <span>Delete student</span>
                  </Link>
                </li>: ''}
                {menues.includes("search")?<li className={`m-1 hover:text-[#00ffff] ${location.pathname.endsWith('/search') ? 'active' : ''}`}>
                  <Link to={"search"} className='text-[18px] flex items-center gap-2 font-medium'>
                    <AiOutlineSearch className='font-medium text-white' style={{ color: 'white' }} />
                    <span>Search student</span>
                  </Link>
                </li>: ''}
                {menues.includes("get-reports")?<li className={`m-1 hover:text-[#00ffff] ${location.pathname.endsWith('/get-reports') ? 'active' : ''}`}>
                  <Link to={"get-reports"} className='text-[18px] flex items-center gap-2 font-medium'>
                    <TbReportSearch className='font-medium text-white' style={{ color: 'white' }} />
                    <span>Get Reports</span>
                  </Link>
                </li>: ''}
                <li className='m-1 hover:text-[#00ffff]'>
                  <p onClick={handleLogout} className={`flex text-[18px] items-center gap-2 cursor-pointer `} >
                    <RiLogoutBoxLine className='font-medium text-white' style={{ color: 'white' }} />
                    <span className='font-medium md:block'>Logout</span>
                  </p>
                </li>
              </ul>
            </div>
          </div>
          <div className="right h-full w-full md:w-[80%] lg:w-[83%] overflow-y-scroll pb-40 ">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
