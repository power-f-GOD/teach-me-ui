import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';
// import Dropdown from 'react-bootstrap/Dropdown';


import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
// import RejectIcon from '@material-ui/icons/Close';
// import AddColleagueIcon from '@material-ui/icons/PersonAdd';
// import Button from '@material-ui/core/Button';
// import { withStyles } from '@material-ui/core/styles';


import { dispatch } from '../../functions/utils';
import { getNotificationRequest } from '../../actions';
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import HowToRegIcon from '@material-ui/icons/HowToReg';
import NotificationsIcon from '@material-ui/icons/Notifications';
// import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';

     
const Notifications = (props: any) => {
  const { getNotifications } = props;
  const [ visibility, setVisibility ] = useState<any | undefined>('hidden')
  useEffect(() => {
    dispatch(getNotificationRequest(Date.now())(dispatch));
    return function() {setVisibility('hidden')}
  }, [])

  const result = getNotifications.data;
  // const lastDate = result[(result.length - 1)].date;
  setTimeout(()=>{setVisibility('visible')}, 600);
  return getNotifications.status === 'pending' ? (
    <div style={{ visibility: visibility}}>
    <Box className='Notifications '>
    <div className='Notifications-div'>

      <Container className='d-flex flex-column justify-content-center'>
        <Box className='notification-container mx-auto'>
          <h2 style={{ color: 'black', marginLeft: '2rem'}}>{/*Getting notifications...*/}</h2>

        </Box>
      </Container>

    </div>
    </Box>
    </div>
  ) : (
    <div style={{ visibility: visibility}}>

    <Box className='Notifications ' /*onScroll={
      // if () {
      //   dispatch(getNotificationRequest(lastDate)(dispatch))
      //   }
      }*/>
    <div className='Notifications-div'>

      <Container className='d-flex flex-column justify-content-center notification-container1'>
        <Box className='notification-container mx-auto'>
          <h2 style={{ paddingLeft: '1rem', color: 'black' }}><b>Notifications</b></h2>
          
            {result.map((notification: any, key: number) => {
              // const link = `/${notification.data.sender}`;
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
                  return time.format('ll'); 
                } else if (duration.weeks() > 0) {
                  return duration.weeks() > 1 ? time.format('ll') : 'a week ago';
                } else if (duration.days() > 0) {
                  return duration.days() > 1 ? duration.days() + ' days ago' : 'a day ago';
                } else if (duration.hours() > 0) {
                  return duration.hours() > 1 ? duration.hours() + ' hours ago' : 'an hour ago';
                } else if (duration.minutes() > 0) {
                  return duration.minutes() > 1 ? duration.minutes() + ' minutes ago' : 'a minute ago';
                } else if (duration.seconds() > 0) {
                  return duration.seconds() > 1 ? duration.seconds() + 'seconds ago' : 'just now';
                } 
              })(date)
              const notificationMessage = `<div>${notification.message}</div>
                                          <div style="color: rgb(0, 115, 160)">${formattedDate}</div>`;

              // const BootstrapButton = withStyles({
              //   root: {
              //     boxShadow: 'none',
              //     textTransform: 'none',
              //     fontSize: 'inherit',
              //     padding: '6px 12px',
              //     // border: '1px solid',
              //     borderRadius: '5px',
              //     // lineHeight: 1.5,
              //     backgroundColor: '#ff0000',
              //     // borderColor: '#0063cc',
              //     width: '6rem',
              //     height: '2rem',
              //     '&:hover': {
              //       backgroundColor: '#0069d9',
              //       // borderColor: '#0062cc',
              //       // boxShadow: 'none',
              //     },
                  
              //     // '&:focus': {
              //     //   boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
              //     // },
              //   },
              // })(Button);
                                          
              return (
                <ListItem  key={key} className='notification-result'>
                  <div style={{ color: 'black' }} className='d-flex'>
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
                    }}>
                  </div> 
                  </div>
                    {/* {notification.type === 'COLLEAGUE_REQUEST'
                    ? <div style={{ display: 'block', marginLeft: '2.8rem'}}>
                        <BootstrapButton variant="contained" color="primary"  className=''>
                          <AddColleagueIcon fontSize='inherit' /> Accept
                        </BootstrapButton>
                        <BootstrapButton variant="contained" color="primary"  className=''>
                          <RejectIcon fontSize='inherit' /> Decline
                        </BootstrapButton>
                      </div>
                    : <React.Fragment></React.Fragment> */}
                    
                </ListItem>
            )})}
        </Box>
      </Container>    
      </div>
    
    </Box>
    </div>
  )
  
}
const mapStateToProps = ({ getNotifications }: any) => ({ getNotifications });
      
export default connect(mapStateToProps)(Notifications);