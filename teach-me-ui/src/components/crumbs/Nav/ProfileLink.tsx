import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

import { FAIcon } from '../../shared/Icons';

import { handleSignoutRequest } from '../../../functions';
import { UserData } from '../../../types';

const ProfileLink = (props: { userData?: UserData; className?: string }) => {
  const { displayName, username, profile_photo } = props.userData || {};

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const history = useHistory();

  const handleProfileNavigation = () => {
    history.push(`/@${username}`);
  };

  const handleProfileAvatarClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = (
    action: 'profile' | 'signout' | null
  ) => () => {
    setMenuAnchorEl(null);

    switch (action) {
      case 'profile':
        handleProfileNavigation();
        break;
      case 'signout':
        handleSignoutRequest();
        break;
    }
  };

  return (
    <>
      {' '}
      <Tooltip title='View Profile or Sign out'>
        <NavLink
          to='/@'
          isActive={(_, { pathname }) => /\/(@\w+|profile\/.+)/.test(pathname)}
          onClick={(e: any) => {
            e.preventDefault();
            handleProfileAvatarClick(e);
          }}
          className={`nav-link avatar p-0 ${props.className}`}>
          <Avatar
            className='profile-photo'
            alt={displayName}
            src={profile_photo}
          />
        </NavLink>
      </Tooltip>
      <Menu
        id='simple-menu'
        anchorEl={menuAnchorEl}
        keepMounted
        open={!!menuAnchorEl}
        onClose={handleProfileMenuClose(null)}
        transformOrigin={{
          vertical: -80,
          horizontal: 'center'
        }}>
        <MenuItem onClick={handleProfileMenuClose('profile')}>
          <ListItemIcon>
            <Avatar className='mr-2' alt={displayName} src={profile_photo} />
          </ListItemIcon>
          <ListItemText
            primary={displayName}
            className='font-bold'
            secondary={'My Profile'}
          />
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose('signout')}>
          <ListItemIcon>
            <FAIcon name='sign-out-alt' fontSize='1.25rem' className='mr-2' />
          </ListItemIcon>
          <ListItemText primary='Sign Out' />
        </MenuItem>
      </Menu>
    </>
  );
};

export default connect(({ userData }: { userData: UserData }) => ({
  userData
}))(ProfileLink);
