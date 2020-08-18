import React, {
  useEffect
} from 'react';

import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import { 
  dispatch, 
  formatDate, 
  formatNotification 
} from '../../functions/utils';
import { getNotificationsRequest } from '../../actions';

const Notifications = (props: any) => {
  const { getNotifications } = props;
  const result = getNotifications.data.notifications;
  const entities = getNotifications.data.entities;

  useEffect(() => {
    dispatch(getNotificationsRequest(Date.now())(dispatch));
  }, [])

  
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
                <h2 style={{ color: 'black', marginLeft: '2rem' }}>
                </h2>
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
                      const dateColor = read ? '#888' : 'rgb(0, 115, 160)';
                      const textColor = read ? '#888' : '#000';
                      const notificationDate = formatDate(date);
                      const notificationMessage = `<div style="color: ${textColor}">${formatNotification(entities,notification.message)}
                        <p style="margin: 0 ; padding: 0; border: 0;color: ${dateColor}">${notificationDate}</p></div>`;
                    
                      return (
                        <Link to={`${action}`} style={{textDecoration: 'none'}} key={key}> 
                          <ListItem key={key} className='notification-result'>
                            <div style={{ color: 'black' }} className='d-flex'>
                              <Avatar
                                component='span'
                                className='profile-avatar-x profile-photo'
                                src={'/images/avatar-1.png'}
                              />

                              <div
                                className=''
                                style={{ paddingLeft: '0.4em' }}
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
