import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import { dispatch } from '../../functions/utils';
import { getNotificationRequest } from '../../actions';
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import NotificationsIcon from '@material-ui/icons/Notifications'
import moment from 'moment';

     
const Notifications = (props: any) => {
  const { getNotifications } = props;
  useEffect(() => {
    dispatch(getNotificationRequest(Date.now())(dispatch))
  }, [])

  const result = getNotifications.data;
  

  return getNotifications.status === 'pending' ? (
    <Box className='Notifications fade-in'>
    <div className='Notifications-div'>

      <Container className='d-flex flex-column justify-content-center'>
        <Box className='notification-container mx-auto'>
          <h3>Getting Notifications...</h3>

        </Box>
      </Container>

    </div>
    </Box>
  ) : (
    <Box className='Notifications fade-in'>
    <div className='Notifications-div'>

      <Container className='d-flex flex-column justify-content-center'>
        <Box className='notification-container mx-auto'>
          
            {result.map((notification: any, key: number) => {
              const link = `/${notification.data.sender}`;
              const date = new Date(notification.date);
              const formattedDate = ((dateTime) => {
                if (!dateTime) {
                  return null;
                }
              
                const today = moment();
              
                const time = moment(dateTime);
              
                const diff = today.diff(time);
              
                const duration = moment.duration(diff);
                if (duration.years() > 0) {
                  return duration.years() > 1 ? duration.years() + ' years ago' : 'a year ago';
                } else if (duration.weeks() > 0) {
                  return duration.weeks() > 1 ? duration.weeks() + ' weeks ago'  : 'a week ago';
                } else if (duration.days() > 0) {
                  return duration.days() > 1 ? duration.days() + ' days ago' : 'a day ago';
                } else if (duration.hours() > 0) {
                  return duration.hours() > 1 ? duration.hours() + ' hours ago' : 'an hour ago';
                } else if (duration.minutes() > 0) {
                  return duration.minutes() > 1 ? duration.minutes() + ' minutes ago' : 'a minute ago';
                } else if (duration.minutes() < 1) {
                  return 'seconds ago';
                }
              })(date)
              const notificationMessage = `<div>${notification.message}</div>
                                          <div>${formattedDate}</div>`
              return (
                <ListItem button divider key={key} className='notification-result'>
                  <Link to= {link} className='d-flex'>
                  {notification.type === 'COLLEAGUE_REQUEST'
                  ? <PersonAddIcon fontSize='large'/>
                  : notification.type === 'COLLEAGUE_REQUEST_ACCEPTANCE'
                    ? <HowToRegIcon fontSize='large'/>
                    : <NotificationsIcon fontSize='large'/>}
                  <div
                    className=''
                    style={{paddingLeft: '0.7em'}}
                    dangerouslySetInnerHTML={{
                      __html: notificationMessage
                    }}></div>
                  </Link>
                </ListItem>
            )})}
        </Box>
      </Container>    
      </div>
    
    </Box>
  )
  
}
const mapStateToProps = ({ getNotifications }: any) => ({ getNotifications });
      
export default connect(mapStateToProps)(Notifications);