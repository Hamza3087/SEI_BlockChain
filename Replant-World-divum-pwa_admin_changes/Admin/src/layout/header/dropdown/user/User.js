import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserAvatar from '../../../../components/user/UserAvatar';
import { DropdownToggle, DropdownMenu, Dropdown } from 'reactstrap';
import { Icon } from '../../../../components/Component';
import { LinkList } from '../../../../components/links/Links';
import { useThemeUpdate } from '../../../provider/Theme';
import { ReactComponent as EncryptIcon } from '../../../../images/icons/encrypt.svg';
import { logout } from '../../../../redux/actions/logoutAction';
import { generatePasswordResetLink } from '../../../../redux/actions/passwordResetLinkAction';
import { useNavigate } from 'react-router-dom';
import i18n from '../../../../locales/en.json';

const User = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeUpdate = useThemeUpdate();
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const passwordLinkStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  };

  const toggle = () => {
    themeUpdate.sidebarHide();
    setOpen((prevState) => !prevState);
  };

  const { success } = useSelector((state) => state.logout);

  useEffect(() => {
    if (success) {
      navigate('/login'); // navigate immediately after logout success
    }
  }, [success, navigate]);

  const triggerLogout = () => {
    dispatch(logout());
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(generatePasswordResetLink(user?.user_id));
      if (response?.reset_link) {
        // Extract uid and token from the reset link
        const url = new URL(response?.reset_link);
        const params = {
          uid: url.searchParams.get('uid'),
          token: url.searchParams.get('token')
        };
        navigate('/auth-reset-password', { state: params });
      }
    } catch (error) {
      console.error('Error generating reset link:', error);
    }
  };

  return (
    <Dropdown
      isOpen={open}
      className='user-dropdown'
      toggle={toggle}
    >
      <DropdownToggle
        tag='a'
        href='#toggle'
        className='dropdown-toggle'
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <div className='user-toggle'>
          <UserAvatar
            icon='user-alt'
            className='sm'
          />
        </div>
      </DropdownToggle>
      <DropdownMenu
        end
        className='dropdown-menu-md dropdown-menu-s1'
      >
        <div className='dropdown-inner user-card-wrap bg-lighter d-none d-md-block'>
          <div className='user-card sm'>
            <div className='user-avatar'>
              <span>{user?.username?.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className='user-info'>
              <span
                className='lead-text fw-medium profile-info'
                style={{ fontSize: '15px' }}
              >
                {user?.username}
              </span>
              <span
                className='sub-text fw-medium'
                style={{ fontSize: '13px' }}
              >
                {user?.email}
              </span>
            </div>
          </div>
        </div>
        <div className='dropdown-inner'>
          <LinkList>
            <a
              href='#'
              onClick={handleChangePassword}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={passwordLinkStyle}
            >
              <EncryptIcon
                width='20'
                height='20'
                fill={isHovered ? '#1D5942' : '#526484'}
              />
              <span
                className='fw-medium'
                style={{ fontSize: '15px' }}
              >
                {i18n.changePassword}
              </span>
            </a>
          </LinkList>
        </div>
        <div className='dropdown-inner'>
          <LinkList>
            <a
              href={`${process.env.PUBLIC_URL}/login`}
              onClick={triggerLogout}
            >
              <Icon name='signout'></Icon>
              <span
                className='fw-medium'
                style={{ fontSize: '15px' }}
              >
                {i18n.logout}
              </span>
            </a>
          </LinkList>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default User;
