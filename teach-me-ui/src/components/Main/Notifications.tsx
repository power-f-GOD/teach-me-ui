import React, { 
  // useState,
  useEffect 
} from 'react';
// import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';
// import Dropdown from 'react-bootstrap/Dropdown';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
// import RejectIcon from '@material-ui/icons/Close';
// import AddColleagueIcon from '@material-ui/icons/PersonAdd';
// import Button from '@material-ui/core/Button';
// import { withStyles } from '@material-ui/core/styles';

import { dispatch, formatDate } from '../../functions/utils';
import { getNotificationsRequest } from '../../actions';
// import PersonAddIcon from '@material-ui/icons/PersonAdd'
// import HowToRegIcon from '@material-ui/icons/HowToReg';
// import NotificationsIcon from '@material-ui/icons/Notifications';
// import CircularProgress from '@material-ui/core/CircularProgress';

const Notifications = (props: any) => {
  const { getNotifications } = props;

  useEffect(() => {
    setTimeout(
      dispatch(getNotificationsRequest(Date.now())(dispatch)),
      1000
    )
  }, []);

  // const [state, setState] = useState({
  //   result: getNotifications.data,
  //   lastDate: 0
  // });
  /* <Dropdown className='dropdown'>
          <Dropdown.Toggle id='dropdown' as='p' on='true'>
            <Tooltip title='Notifications' placement='bottom'>
              <NotificationsIcon />
            </Tooltip>
          </Dropdown.Toggle>
          
        </Dropdown> */

  // const apiResult = getNotifications.data;
  // setState({
  //   ...state,
  //   result: apiResult
  //   lastDate: apiResult[(apiResult.length - 1)].date,
  // });
  let result = getNotifications.data;
  return (
    <Box className='dropdown-contents' marginTop='7rem'>
      {getNotifications.status === 'pending' ? (
        <Box className='Notifications '>
          <div className='Notifications-div'>
            <Container className='d-flex flex-column justify-content-center'>
              <Box className='notification-container mx-auto'>
                <h2 style={{ color: 'black', marginLeft: '2rem' }}>
                  {/*Getting notifications...*/}
                </h2>
              </Box>
            </Container>
          </div>
        </Box>
      ) : (
        // <div style={{ visibility: visibility}}>

        <Box
          className='Notifications ' /*onScroll={
      // if () {
      //   dispatch(getNotificationRequest(lastDate)(dispatch))
      //   }
      }*/
        >
          <div className='Notifications-div'>
            <Container className='d-flex flex-column justify-content-center notification-container1'>
              <Box className='notification-container mx-auto'>
                <h2 className='notification-text'>Notifications</h2>

                {result[0]
                  ? result.map((notification: any, key: number) => {
                      // const link = `/${notification.data.sender}`;
                      const date = new Date(notification.date);
                      const notificationDate = formatDate(date);
                      
                      // const icon = notification.type === 'COLLEAGUE_REQUEST'
                      //             ? <PersonAddIcon fontSize='inherit'/>
                      //             : notification.type === 'COLLEAGUE_REQUEST_ACCEPTANCE'
                      //               ? <HowToRegIcon fontSize='inherit'/>
                      //               : <NotificationsIcon fontSize='inherit'/>
                      const notificationMessage = `<div>${notification.message}
                                                  <p style="margin: 0 ; padding: 0; border: 0;color: rgb(0, 115, 160)">${notificationDate}</p></div>`;

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
