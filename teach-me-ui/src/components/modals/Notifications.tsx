import React from 'react';

import Skeleton from 'react-loading-skeleton';

import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import { formatDate, formatNotification } from '../../utils';
import { displayModal } from '../../functions';

const Notifications = (props: any) => {
  const { notifications } = props;
  const result = notifications.data.notifications;
  const entities = notifications.data.entities;

  const removeModal = () => {
    displayModal(false, true);
  };

  const closeModal = (e: any) => {
    if (String(window.location.hash) === '') removeModal();
  };

  window.onhashchange = closeModal;

  let read = false;
  const makeReadTrue = () => {
    read = true;
  };

  setTimeout(() => {
    window.location.hash = 'modal';
  }, 0);

  return (
    <Box className='dropdown-contents'>
      {notifications.status === 'pending' ? (
        <Box className='first-skeleton notification-container mx-auto'>
          {Array(6)
            .fill('')
            .map((j, i) => (
              <React.Fragment key={i}>
                <Skeleton
                  width={300}
                  className='skeleton-loader notifications-skeleton'
                />
                <br />
                <Skeleton
                  width={250}
                  className='skeleton-loader notifications-skeleton'
                />
                <br />
                <Skeleton
                  width={70}
                  className='skeleton-loader notifications-skeleton'
                />
                <br
                  className={`${i !== 5 ? 'display-block' : 'display-none'}`}
                />
                <br
                  className={`${i !== 5 ? 'display-block' : 'display-none'}`}
                />
              </React.Fragment>
            ))}
        </Box>
      ) : (
        <Container className='d-flex flex-column justify-content-center notification-container1'>
          <Box className='notification-container mx-auto'>
            {result[0] ? (
              result.map((notification: any, key: number) => {
                notification.seen && makeReadTrue();
                const action = notification.action || '';
                const date = new Date(notification.date);
                const notificationDate = formatDate(date);
                const notificationMessage = `<div class="${
                  read ? 'read-notifications' : 'unread-notifications'
                }">${formatNotification(entities, notification.message)}
                    <p class="no-space ${
                      read
                        ? 'read-notifications-date'
                        : 'unread-notifications-date'
                    }">${notificationDate}</p></div>`;
                return (
                  <ListItem
                    key={key}
                    className={`notification-result p-2 ${
                      read
                        ? 'notification-background-read'
                        : 'notification-background-unread'
                    }`}>
                    <Link
                      to={`${action}`}
                      key={key}
                      style={{ textDecoration: 'none' }}
                      onClick={(e: any) => {
                        removeModal();
                      }}>
                      {' '}
                      <div className='d-flex color-black'>
                        <Avatar
                          component='span'
                          className='notification-avatar'
                          src={
                            notification.profile_photo
                              ? notification.profile_photo
                              : '/images/avatar-1.png'
                          }
                        />

                        <div
                          className='pl-2'
                          dangerouslySetInnerHTML={{
                            __html: notificationMessage
                          }}></div>
                      </div>
                    </Link>
                  </ListItem>
                );
              })
            ) : (
              <ListItem> No notifications yet...</ListItem>
            )}
          </Box>
        </Container>
      )}
    </Box>
  );
};
const mapStateToProps = ({ notifications }: any) => ({ notifications });

export default connect(mapStateToProps)(Notifications);
