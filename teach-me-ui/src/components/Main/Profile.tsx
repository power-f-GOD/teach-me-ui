import React, {
  useState,
  useCallback,
  useEffect,
  createRef,
  useMemo
} from 'react';

import { useApi } from '../../hooks';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import AddColleagueIcon from '@material-ui/icons/PersonAdd';
import PendingIcon from '@material-ui/icons/RemoveCircle';
import RejectIcon from '@material-ui/icons/Close';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import SchoolOutlinedIcon from '@material-ui/icons/SchoolOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import Loader from '../crumbs/Loader';
import {
  UserData,
  DeepProfileProps,
  useApiResponse
} from '../../constants/interfaces';
import { dispatch } from '../../functions';
import { displaySnackbar } from '../../actions';
import {
  getProfileData,
  profileData as _profileData
} from '../../actions/profile';
/**
 * Please, Do not delete any commented code; You can either uncomment them to use them or leave them as they are
 */

interface InfoProps {
  name: string;
  value: string;
}

interface InfoInputProps {
  id: string;
  label?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  inputRef: any;
  error: boolean;
  helperText: string;
  onChange: Function;
  inputProps: any;
}

export const refs: any = {
  firstnameInput: createRef<HTMLInputElement>(),
  lastnameInput: createRef<HTMLInputElement>(),
  usernameInput: createRef<HTMLInputElement>(),
  emailInput: createRef<HTMLInputElement>(),
  dobInput: createRef<HTMLInputElement>(),
  // passwordInput: createRef<HTMLInputElement>(),
  institutionInput: createRef<HTMLInputElement>(),
  departmentInput: createRef<HTMLInputElement>(),
  levelInput: createRef<HTMLInputElement>()
};

const cleanUp = (isUnmount: boolean) => {
  let shouldCleanUp = /@/.test(window.location.pathname);

  shouldCleanUp = isUnmount ? isUnmount : shouldCleanUp;

  if (shouldCleanUp) {
    dispatch(
      _profileData({
        status: 'settled',
        err: false,
        data: [{}]
      })
    );
  }
};

window.addEventListener('popstate', () => cleanUp(false));
window.addEventListener('pushstate', () => cleanUp(false));

let [
  avatar,
  firstname,
  lastname,
  displayName,
  username,
  email,
  dob,
  institution,
  department,
  level
] = Array(10).fill('');

let basicInfo: InfoProps[];
let academicInfo: InfoProps[];

const basicInfoIds = ['firstname', 'lastname', 'username', 'dob', 'email'];
const academicInfoIds = ['institution', 'department', 'level'];

const Profile = (props: any) => {
  const { profileData, userData } = props;
  const data: UserData = profileData.data[0];
  const { status } = profileData;
  const { auth } = props;
  const { isAuthenticated } = auth;
  const token = (userData as UserData).token;

  let userId = window.location.pathname.split('/').slice(-1)[0];
  const isId = /^@\w+$/.test(userId);
  userId = isId ? userId.toLowerCase() : username;
  // here is where the check is made to render the views accordingly
  const isSelf = userId === username;
  let selfView = isAuthenticated ? isSelf : false;

  const [addColleague, , addColleagueIsLoading] = useApi<any>(
    {
      endpoint: '/colleague/request',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { colleague: data.id }
  );
  const [
    fetchDeepProfile,
    deepProfileData,
    deepProfileIsLoading
  ]: useApiResponse<DeepProfileProps> = useApi<any>({
    endpoint: `/deep/profile/${data.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  const [removeColleagueRequest, , removeColleagueIsLoading] = useApi<any>(
    {
      endpoint: '/colleague/request/remove',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { request_id: deepProfileData?.request_id }
  );

  const [acceptColleagueRequest, , acceptColleagueIsLoading] = useApi<any>(
    {
      endpoint: '/colleague/request/accept',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { request_id: deepProfileData?.request_id }
  );

  const [declineColleagueRequest, , declineColleagueIsLoading] = useApi<any>(
    {
      endpoint: '/colleague/request/decline',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { request_id: deepProfileData?.request_id }
  );
  const [unColleagueRequest, , unColleagueIsLoading] = useApi<any>(
    {
      endpoint: '/uncolleague',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    },
    { colleague: data.id }
  );

  useEffect(() => {
    if (data.username !== undefined && !selfView) {
      fetchDeepProfile().catch((e) => {
        dispatch(
          displaySnackbar({
            open: true,
            message: e.message,
            severity: 'error',
            autoHide: true
          })
        );
      });
    }
  }, [data.username, selfView]);

  const onColleagueActionClick = async (e: any) => {
    switch (deepProfileData.status) {
      case 'NOT_COLLEAGUES':
        await addColleague().catch((e) => {
          dispatch(
            displaySnackbar({
              open: true,
              message: e.message,
              severity: 'error',
              autoHide: true
            })
          );
        });
        break;
      case 'PENDING_REQUEST':
        await removeColleagueRequest().catch((e) => {
          dispatch(
            displaySnackbar({
              open: true,
              message: e.message,
              severity: 'error',
              autoHide: true
            })
          );
        });
        break;
      case 'AWAITING_REQUEST_ACTION':
        const p =
          e.target.id === 'decline'
            ? acceptColleagueRequest()
            : declineColleagueRequest();
        await p.catch((e) => {
          dispatch(
            displaySnackbar({
              open: true,
              message: e.message,
              severity: 'error',
              autoHide: true
            })
          );
        });
        break;
      case 'IS_COLLEAGUE':
        await unColleagueRequest().catch((e) => {
          dispatch(
            displaySnackbar({
              open: true,
              message: e.message,
              severity: 'error',
              autoHide: true
            })
          );
        });
        break;
    }
    await fetchDeepProfile().catch((e) => {
      dispatch(
        displaySnackbar({
          open: true,
          message: e.message,
          severity: 'error',
          autoHide: true
        })
      );
    });
  };

  avatar = data.avatar || 'avatar-1.png';
  firstname = data.firstname || '';
  lastname = data.lastname || '';
  displayName = data.displayName || '';
  email = data.email || '';
  dob = data.dob?.split('-').reverse().join('-') || '';
  institution = data.institution || '';
  department = data.department || '';
  level = data.level || '';

  //username of currently authenticated user which will be used to check if the current profile data requested is for another user or currently authenticated user in order to render the views accordingly
  username = '@' + (userData.username || '');

  basicInfo = [
    { name: 'Firstname', value: firstname },
    { name: 'Lastname', value: lastname },
    { name: 'Username', value: username },
    { name: 'Date of birth', value: dob },
    { name: 'Email', value: email }
  ];
  academicInfo = [
    { name: 'Institution', value: institution },
    { name: 'Department', value: department },
    { name: 'Level', value: level }
  ];

  // const [passedThreshold, setPassedThreshold] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputProps = useMemo(() => {}, []);
  const handleBasicInputChange = useCallback(() => {}, []);

  const handleAcademicInputChange = useCallback(() => {}, []);

  const basicInfoInputsOptions: InfoInputProps[] = Array(5)
    .fill({})
    .map((_, idx) => {
      const id = basicInfoIds[idx];

      return {
        id,
        defaultValue: id === 'dob' ? dob : profileData[id],
        error: false,
        helperText: ' ',
        inputRef: refs[`${id}Input`],
        onChange: handleBasicInputChange,
        inputProps
      };
    });

  const academicInfoInputsOptions: InfoInputProps[] = Array(3)
    .fill({})
    .map((_, idx) => {
      const id = academicInfoIds[idx];

      return {
        id,
        defaultValue: profileData[id],
        error: false,
        helperText: ' ',
        inputRef: refs[`${id}Input`],
        onChange: handleAcademicInputChange,
        inputProps
      };
    });

  const handleEditClick = useCallback(() => {
    if (!isEditing) {
      setIsEditing(true);
    }
  }, [isEditing]);

  const handleCancelEditClick = useCallback(() => {
    setIsEditing(false);
  }, []);

  // const handleAddColleagueClick = useCallback(() => {

  // });

  useEffect(() => {
    if (!selfView) {
      // academicInfo =
      return () => {
        window.scrollTo(0, 0);
      };
    }

    // const trigger = () => setPassedThreshold(window.scrollY > 50);
    let swipeArea: any = null;

    //hide M-UI's (invisible) swipeArea element for the sake of it not interfering with the edit buttons on the right when they're tapped on mobile devices
    window.setTimeout(() => {
      swipeArea = document.querySelector("[class*='SwipeArea']") as any;

      if (swipeArea) {
        swipeArea.style.display = 'none';
      }
    }, 200);
    // window.addEventListener('scroll', trigger);

    return () => {
      if (swipeArea) swipeArea.style.display = 'block';

      // window.removeEventListener('scroll', trigger);
      window.scrollTo(0, 0);
    };
  }, [selfView]);

  useEffect(() => {
    dispatch(getProfileData(userId.replace('@', ''))(dispatch));

    return () => {
      //clean up after every unmount to prevent flash of profile page before load of profile data
      cleanUp(true);
    };
  }, [userId]);

  if (!isId) {
    return <Redirect to={`/${userId}`} />;
  } else if (profileData.err || !profileData.data[0]) {
    return <Redirect to='/404' />;
  }

  if (status !== 'fulfilled') {
    //instead of this, you can use a React Skeleton loader; didn't have the time to add, so I deferred.
    return <Loader />;
  }

  return (
    <Box
      className={`Profile ${selfView ? 'self-view' : ''} fade-in pb-5`}
      paddingTop='5rem'>
      <Container className='rows-wrapper custom-scroll-bar small-bar rounded-bar tertiary-bar p-0'>
        <Row as='section' className='m-0 px-3 flex-column mb-5'>
          <Box
            className={`action-buttons-container ${
              isEditing ? 'enlarge' : ''
            } ${
              /*passedThreshold*/ 'apiNotReady' && false ? 'add-background' : ''
            } ${selfView ? 'self-view' : ''}`}>
            {false &&
              (selfView ? (
                <>
                  <Button
                    variant='contained'
                    size='large'
                    className='edit-button'
                    color='primary'
                    onClick={handleEditClick}>
                    {isEditing ? (
                      <>
                        <SaveOutlinedIcon /> Save Edit
                      </>
                    ) : (
                      <>
                        <CreateOutlinedIcon fontSize='inherit' /> Edit Profile
                      </>
                    )}
                  </Button>
                  <Button
                    variant='contained'
                    size='large'
                    className='close-edit-button'
                    color='primary'
                    onClick={handleCancelEditClick}>
                    <CloseOutlinedIcon fontSize='inherit' /> Cancel Edit
                  </Button>
                </>
              ) : (
                ''
              ))}
          </Box>

          <Col className='p-0 d-flex justify-content-center'>
            <Avatar
              component='span'
              className='profile-avatar'
              alt={displayName}
              src={`/images/${avatar}`}
            />
          </Col>
          <Col className='d-flex flex-column p-0'>
            <Col as='span' className='display-name p-0 d-block my-1'>
              {displayName}
            </Col>
            <Col
              as='span'
              className='username p-0 d-flex justify-content-center mb-3'>
              {userId}
            </Col>
            <Col as='span' className='status p-0 px-3 d-block'>
              {/* <CreateOutlinedIcon className='mr-2' /> */}
              Currently creating some amazing sturvs...
            </Col>
          </Col>

          {!selfView && (
            <Col className='d-flex justify-content-center mt-4'>
              {isAuthenticated && deepProfileData !== null ? (
                <>
                  {deepProfileData.status === 'NOT_COLLEAGUES' && (
                    <Button
                      variant='contained'
                      size='large'
                      className='colleague-action-button'
                      color='primary'
                      onClick={onColleagueActionClick}>
                      {addColleagueIsLoading || deepProfileIsLoading ? (
                        <CircularProgress color='inherit' size={28} />
                      ) : (
                        <>
                          <AddColleagueIcon fontSize='inherit' /> Add Colleague
                        </>
                      )}
                    </Button>
                  )}
                  {deepProfileData.status === 'PENDING_REQUEST' && (
                    <Button
                      variant='contained'
                      size='large'
                      className='colleague-action-button'
                      color='primary'
                      onClick={onColleagueActionClick}>
                      {removeColleagueIsLoading || deepProfileIsLoading ? (
                        <CircularProgress color='inherit' size={28} />
                      ) : (
                        <>
                          <PendingIcon fontSize='inherit' /> Cancel Request
                        </>
                      )}
                    </Button>
                  )}
                  {deepProfileData.status === 'AWAITING_REQUEST_ACTION' && (
                    <>
                      <Button
                        variant='contained'
                        size='large'
                        id='accept'
                        className='colleague-action-button accept-request'
                        color='primary'
                        onClick={onColleagueActionClick}>
                        {acceptColleagueIsLoading || deepProfileIsLoading ? (
                          <CircularProgress color='inherit' size={28} />
                        ) : (
                          <>
                            <AddColleagueIcon fontSize='inherit' /> Accept
                            Request
                          </>
                        )}
                      </Button>
                      <Button
                        variant='contained'
                        size='large'
                        id='decline'
                        className='colleague-action-button decline-request'
                        color='primary'
                        onClick={onColleagueActionClick}>
                        {declineColleagueIsLoading || deepProfileIsLoading ? (
                          <CircularProgress color='inherit' size={28} />
                        ) : (
                          <>
                            <RejectIcon fontSize='inherit' /> Decline
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {deepProfileData.status === 'IS_COLLEAGUE' && (
                    <Button
                      variant='contained'
                      size='large'
                      className='colleague-action-button'
                      color='primary'
                      onClick={onColleagueActionClick}>
                      {unColleagueIsLoading || deepProfileIsLoading ? (
                        <CircularProgress color='inherit' size={28} />
                      ) : (
                        <>
                          <PendingIcon fontSize='inherit' /> Un-colleague
                        </>
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <CircularProgress color='inherit' size={30} />
              )}
            </Col>
          )}
        </Row>

        <Row
          as='section'
          className='info-rows-container justify-content-center m-0'>
          {selfView && (
            <Col lg={6} className='info-card-container py-0'>
              <Row as='section' className='basic-info-card mx-0 flex-column'>
                <Col className='info p-0 d-flex my-1'>
                  <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
                    <Box component='h2' className='card-title mr-auto'>
                      Basic info
                    </Box>
                    <AccountCircleOutlinedIcon className='' fontSize='large' />
                  </Col>
                </Col>

                <hr />

                <Box className='basic-info-section-wrapper'>
                  <Row
                    className={`basic-info-wrapper ${
                      isEditing ? 'hide' : ''
                    } mx-0`}>
                    {basicInfo.map(({ name, value }: InfoProps) => (
                      <Info name={name} value={value} key={name} />
                    ))}
                  </Row>

                  <form
                    className={`basic-info-form mx-0 row ${
                      isEditing ? 'show' : ''
                    }`}
                    noValidate
                    autoComplete='on'
                    onSubmit={(e: any) => e.preventDefault()}>
                    {basicInfoInputsOptions.map((options, key) => (
                      <InfoInput options={options} key={key} />
                    ))}
                  </form>
                </Box>
              </Row>
            </Col>
          )}

          <Col lg={6} className='info-card-container py-0'>
            <Row as='section' className='academic-info-card mx-0'>
              <Col className='info p-0 d-flex my-1'>
                <Col className='py-0 px-2 d-flex justify-content-between align-items-center'>
                  <Box component='h2' className='card-title mr-auto'>
                    Academic info
                  </Box>
                  <SchoolOutlinedIcon className='' fontSize='large' />
                </Col>
              </Col>

              <hr />

              <Box className='academic-info-section-wrapper'>
                <Row
                  className={`academic-info-wrapper ${
                    isEditing ? 'hide' : ''
                  } mx-0`}>
                  {academicInfo.map(({ name, value }: InfoProps) => (
                    <Info name={name} value={value} key={name} />
                  ))}
                </Row>

                <form
                  className={`academic-info-form mx-0 row ${
                    isEditing ? 'show' : ''
                  }`}
                  noValidate
                  autoComplete='on'
                  onSubmit={(e: any) => e.preventDefault()}>
                  {academicInfoInputsOptions.map((options, key) => (
                    <InfoInput options={options} key={key} />
                  ))}
                </form>
              </Box>
            </Row>
          </Col>
        </Row>
      </Container>
    </Box>
  );
};

function Info({ name, value }: any) {
  return (
    <Col
      xs={/email|institution/i.test(name) ? 12 : 6}
      className='info p-0 d-flex mb-3 mt-2'>
      <Col as='span' className='py-0 d-flex flex-column align-items-start px-2'>
        <Box component='span' className='info-name'>
          {name}:
        </Box>
        <Box component='span' className='info-value'>
          {value}
        </Box>
      </Col>
    </Col>
  );
}

function InfoInput(props: any) {
  const id = props.options.id;

  return (
    <Col
      xs={/email|institution/i.test(id) ? 12 : 6}
      className='info p-0 d-flex mb-1'>
      <Col as='span' className='py-0 d-flex flex-column align-items-start px-2'>
        <Box component='span' className='info-name'>
          {id}:
        </Box>
        <TextField
          variant='outlined'
          size='small'
          fullWidth
          {...props.options}
        />
      </Col>
    </Col>
  );
}

const mapStateToProps = (state: any) => ({
  auth: state.auth,
  userData: state.userData,
  profileData: state.profileData
});

export default connect(mapStateToProps)(Profile);
