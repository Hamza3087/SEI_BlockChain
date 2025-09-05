import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import Logo from '../logo/Logo';
import User from './dropdown/user/User';
import { Link, useLocation } from 'react-router-dom';
import { handleTabChange } from '../../redux/actions/dashboardAction';
import { useTheme } from '../provider/Theme';
import { getUserDetails } from '../../redux/actions/authActions';
import i18n from '../../locales/en.json';

const Header = ({ fixed, className, ...props }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);
  const { user } = useSelector((state) => state.auth);

  const theme = useTheme();
  const headerClass = classNames({
    'nk-header': true,
    'nk-header-fixed': fixed,
    [`is-light`]: theme.header === 'white',
    [`is-${theme.header}`]:
      theme.header !== 'white' && theme.header !== 'light',
    [`${className}`]: className
  });

  let currentUrl = location.pathname;
  useEffect(() => {
    if (currentUrl === process.env.PUBLIC_URL + '/') {
      dispatch(handleTabChange('tree'));
    } else if (currentUrl === process.env.PUBLIC_URL + '/people-organization') {
      dispatch(handleTabChange('people'));
    } else if (currentUrl === process.env.PUBLIC_URL + '/nft-history') {
      dispatch(handleTabChange('nft'));
    }
  }, [currentUrl, dispatch]);

  if (window.location.pathname !== undefined) {
    currentUrl = window.location.pathname;
  } else {
    currentUrl = null;
  }

  return (
    <div className={headerClass}>
      <div className='container-lg wide-xl'>
        <div className='nk-header-wrap'>
          <div className='nk-header-brand'>
            <Logo />
          </div>
          <div className='nk-header-menu ms-auto'>
            <ul className='nk-menu nk-menu-main'>
              <li
                className={`nk-menu-item ${
                  currentUrl === process.env.PUBLIC_URL + '/'
                    ? 'active current-page'
                    : ''
                }`}
              >
                <Link
                  to={`${process.env.PUBLIC_URL}/`}
                  className='nk-menu-link'
                >
                  <span
                    className='nk-menu-text fw-normal'
                    style={{
                      color: 'black'
                    }}
                  >
                    {i18n.treeManagement}
                  </span>
                </Link>
              </li>
              <li
                className={`nk-menu-item ${
                  currentUrl === process.env.PUBLIC_URL + '/people-organization'
                    ? 'active current-page'
                    : ''
                }`}
              >
                <Link
                  to={`${process.env.PUBLIC_URL}/people-organization`}
                  className='nk-menu-link'
                >
                  <span
                    className='nk-menu-text fw-normal'
                    style={{
                      color: 'black'
                    }}
                  >
                    {i18n.peopleAndOrganization}
                  </span>
                </Link>
              </li>
              <li
                className={`nk-menu-item ${
                  currentUrl === process.env.PUBLIC_URL + '/nft-history'
                    ? 'active current-page'
                    : ''
                }`}
              >
                <Link
                  to={`${process.env.PUBLIC_URL}/nft-history`}
                  className='nk-menu-link'
                >
                  <span
                    className='nk-menu-text fw-normal'
                    style={{
                      color: 'black'
                    }}
                  >
                    {i18n.nftHistory}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          <div className='nk-header-tools'>
            <ul className='nk-quick-nav'>
              <li className='user-dropdown'>
                <User user={user} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
