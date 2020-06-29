import React, {
  useState,
  useCallback,
  useEffect,
  createRef,
  useMemo
} from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import SchoolOutlinedIcon from '@material-ui/icons/SchoolOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { UserData } from '../../constants/interfaces';
// import GroupIcon from '@material-ui/icons/Group';
// import ForumIcon from '@material-ui/icons/Forum';
// import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';

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

const Profile = (props: any) => {
  const { userData } = props;
  const {
    avatar,
    displayName,
    username: _username,
    email,
    dob: _dob,
    institution,
    department,
    level
  }: UserData = userData;
  const [firstname, lastname] = displayName.split(' ');
  const dob = _dob.split('-').reverse().join('-');
  const username = '@' + _username;
  const { auth } = props;
  const { isAuthenticated } = auth;

  const basicInfo: InfoProps[] = [
    { name: 'Firstname', value: firstname },
    { name: 'Lastname', value: lastname },
    { name: 'Username', value: username },
    { name: 'Date of birth', value: dob },
    { name: 'Email', value: email }
  ];
  const academicInfo: InfoProps[] = [
    { name: 'Institution', value: institution },
    { name: 'Department', value: department },
    { name: 'Level', value: level }
  ];

  const basicInfoIds = ['firstname', 'lastname', 'username', 'dob', 'email'];
  const academicInfoIds = ['institution', 'department', 'level'];

  let userId = window.location.pathname.split('/').slice(-1)[0];
  const isId = /^@\w+$/.test(userId);
  userId = isId ? userId.toLowerCase() : username;
  const isSelf = userId === username;
  let selfView = isAuthenticated ? isSelf : false;

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
        defaultValue: id === 'dob' ? dob : userData[id],
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
        defaultValue: userData[id],
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

  if (!isId) {
    return <Redirect to={`/${userId}`} />;
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
              {isSelf ? displayName : 'Another User'}
            </Col>
            <Col
              as='span'
              className='username p-0 d-flex justify-content-center mb-3'>
              {isSelf ? username : '@another_user'}
            </Col>
            <Col as='span' className='status p-0 px-3 d-block'>
              {/* <CreateOutlinedIcon className='mr-2' /> */}
              Currently creating some amazing sturvs...
            </Col>
          </Col>

          {!selfView && (
            <Col className='d-flex justify-content-center mt-4'>
              {isAuthenticated && (
                <Button
                  variant='contained'
                  size='large'
                  className='add-colleague-button'
                  color='primary'
                  // onClick={handleEditClick}
                >
                  <AddIcon fontSize='inherit' /> Add Colleague
                </Button>
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
  userData: state.userData
});

export default connect(mapStateToProps)(Profile);
