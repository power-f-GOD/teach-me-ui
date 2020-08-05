import React, { 
  useEffect 
} from 'react';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import { dispatch, formatDate } from '../../functions/utils';
import { getNotificationsRequest } from '../../actions';

const Notifications = (props: any) => {
  const { getNotifications } = props;

  useEffect(() => {
    setTimeout(
      dispatch(getNotificationsRequest(Date.now())(dispatch)),
      1000
    )
  }, []);

  let result = getNotifications.data;
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
                      const date = new Date(notification.date);
                      const notificationDate = formatDate(date);
                      const notificationMessage = `<div>${notification.message}
                                                  <p style="margin: 0 ; padding: 0; border: 0;color: rgb(0, 115, 160)">${notificationDate}</p></div>`;

                      return (
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
