import React, {
  useEffect
} from 'react';

import Skeleton from 'react-loading-skeleton';

import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import { 
  // dispatch, 
  formatDate, 
  formatNotification 
} from '../../functions/utils';
import { setLastseen } from '../../actions';

const Notifications = (props: any) => {
  const { getNotifications } = props;
  const result = getNotifications.data.notifications;
  const entities = getNotifications.data.entities;
  const lastNotificationId = result[0] ? result[0]._id : '';

  useEffect(() => {
    return () => {
      if (result[0] && !result[0].last_seen && !getNotifications.fromPing) {
        setLastseen(lastNotificationId);
      }
    }
  })

  let read = false;
  const makeReadTrue = () => {
    read = true;
  }


  return (
    <Box className='dropdown-contents' marginTop='7rem'>
      {getNotifications.status === 'pending' ? (
        <Box className='Notifications '>
          <div className='Notifications-div'>
            <Container className='d-flex flex-column justify-content-center'>
              <Box className='notification-container mx-auto'>
                <h2 className='notification-text'>Notifications</h2>
                {Array(6).fill('').map((j,i) => (
                  <React.Fragment key={i}>
                    <Skeleton width={300} className='skeleton-loader notifications-skeleton'/><br/>
                    <Skeleton width={250} className='skeleton-loader notifications-skeleton'/><br/>
                    <Skeleton width={70} className='skeleton-loader notifications-skeleton'/><br className={`${ i !== 5 ? 'display-block' : 'display-none'}`}/>
                    <br className={`${ i !== 5 ? 'display-block' : 'display-none'}`}/>
                  </React.Fragment>
                ))}
              </Box>
            </Container>
          </div>
        </Box>
      ) : (
        <Box
          className='Notifications '
        >
          <div className='Notifications-div'>
            <Container className='d-flex flex-column justify-content-center notification-container1'>
              <Box className='notification-container mx-auto'>
                <h2 className='notification-text'>Notifications</h2>

                {result[0]
                  ? result.map((notification: any, key: number) => {
                      notification.last_seen && makeReadTrue();
                      const action = notification.action || '';
                      const date = new Date(notification.date);
                      const notificationDate = formatDate(date);
                      const notificationMessage = `<div class="${read ? 'read-notifications' : 'unread-notifications'}">${formatNotification(entities,notification.message)}
                        <p class="no-space ${read ? 'read-notifications-date' : 'unread-notifications-date'}">${notificationDate}</p></div>`;
                    
                      return (
                        <Link to={`${action}`} className='textdecoration-none' key={key}> 
                          <ListItem key={key} className={`notification-result ${ read ? 'notification-background-read' : 'notification-background-unread'}`}>
                            <div className='d-flex color-black'>
                              <Avatar
                                component='span'
                                className='profile-avatar-x profile-photo'
                                src={'/images/avatar-1.png'}
                              />

                              <div
                                className='padding-left-0.4'
                                dangerouslySetInnerHTML={{
                                  __html: notificationMessage
                                }}></div>
                            </div>
                          </ListItem>
                        </Link>
                      );
                    })
                  : <ListItem> No notifications yet...</ListItem>
                }
              </Box>
            </Container>
          </div>
        </Box>
      )}
    </Box>
  );
};
const mapStateToProps = ({ getNotifications }: any) => ({ getNotifications });

export default connect(mapStateToProps)(Notifications);
