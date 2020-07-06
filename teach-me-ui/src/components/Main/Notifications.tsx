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

     
const Notifications = (props: any) => {
  const { getNotifications } = props;
  useEffect(() => {
    dispatch(getNotificationRequest(Date.now())(dispatch))
  }, [])

  const result = getNotifications.data;
  

  return getNotifications.status === 'pending' ? (
    <h3>Getting Notifications...</h3>
  ) : (
    <Box className='Notifications fade-in' paddingY='4.5rem'>
      <Container className='d-flex flex-column justify-content-center'>
        <Box className='notification-container mx-auto'>
          
            {result.map((notification: any, key: number) => {
              const link = `/${notification.data.sender}`;
              const date = new Date(notification.date);
              const aDay = 86400000;
              const dateString = date.toDateString();
              const formattedDate = Date.now() - notification.date < aDay
                                    ? `${new Date( Date.now() - notification.date).getHours()} hours ago`
                                    : Date.now() - notification.date < (aDay * 2)
                                      ? `Yesterday at ${date.getHours()}:${date.getMinutes()}`
                                      : `${dateString.substring(0, dateString.length - 5)}`
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
    </Box>
  )
  
}
const mapStateToProps = ({ getNotifications }: any) => ({ getNotifications });
      
export default connect(mapStateToProps)(Notifications);