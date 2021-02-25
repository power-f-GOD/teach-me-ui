import React from 'react';

import Skeleton from 'react-loading-skeleton';

import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import {
  formatDate,
  formatNotification,
  eraseLastHistoryStateOnClick,
  dispatch
} from '../../utils';
import Loader from '../shared/Loaders';
import { getNotifications } from '../../actions';
import { displayModal } from '../../functions';

const Notifications = (props: any) => {
  const { notifications } = props;
  const result = notifications.data.notifications;
  const entities = notifications.data.entities;
  let read = false;

  const makeReadTrue = () => {
    read = true;
  };

  const fetchMoreNotifications = () => {
    dispatch(getNotifications(result[result.length - 1].date));
  };

  return (
    <Box className='dropdown-contents'>
      {notifications.status === 'pending' && !result[0] ? (
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

                if (notification.seen) {
                  makeReadTrue();
                }

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
                      onClick={() => {
                        eraseLastHistoryStateOnClick(action);
                        displayModal(false, true, undefined);
                      }}>
                      {' '}
                      <div className='d-flex color-black'>
                        <Avatar
                          component='span'
                          className='notification-avatar'
                          src={
                            entities[
                              notification.message?.replace(
                                /.*{{(\w+)}}.*/,
                                '$1'
                              )
                            ]?.profile_photo
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
            {result[0] && notifications.status === 'pending' ? (
              <Loader
                type='ellipsis'
                inline={true}
                color='#555'
                size={6}
                className='notification-loader'
              />
            ) : (
              notifications.statusText !== 'the end' &&
              result[0] && (
                <Button
                  onClick={fetchMoreNotifications}
                  className='see-more-button'>
                  {' '}
                  See more{' '}
                </Button>
              )
            )}
          </Box>
        </Container>
      )}
    </Box>
  );
};
const mapStateToProps = ({ notifications }: any) => ({ notifications });

export default connect(mapStateToProps)(Notifications);
