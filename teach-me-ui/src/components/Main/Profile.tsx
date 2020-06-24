import React, {
  useState,
  useCallback,
  useEffect,
  createRef,
  useMemo
} from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
// import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import SchoolOutlinedIcon from '@material-ui/icons/SchoolOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
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

let userInfo: any = {};
let [
  avatar,
  displayName,
  username,
  email,
  dob,
  institution,
  department,
  level
] = Array(8).fill('');

if (navigator.cookieEnabled && localStorage.kanyimuta) {
  userInfo = JSON.parse(localStorage.kanyimuta);
  avatar = 'avatar-1.png';
  displayName = userInfo.displayName;
  username = userInfo.username;
  email = userInfo.email;
  dob = userInfo.date_of_birth.split('-').reverse().join('-');
  institution = userInfo.institution;
  department = userInfo.department;
  level = userInfo.level;
}

const [firstname, lastname] = displayName.split(' ');

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

const basicInfoIds = ['firstname', 'lastname', 'username', 'dob', 'email'];
const academicInfoIds = ['institution', 'department', 'level'];

const Profile = () => {
  const [passedThreshold, setPassedThreshold] = useState<boolean>(false);
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
        defaultValue: id === 'dob' ? dob : userInfo[id],
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
        defaultValue: userInfo[id],
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

  useEffect(() => {
    const trigger = () => setPassedThreshold(window.scrollY > 100);

    window.addEventListener('scroll', trigger);

    return () => {
      window.removeEventListener('scroll', trigger);
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <Box className='Profile fade-in pb-5' paddingTop='5rem'>
      <Container className='rows-wrapper custom-scroll-bar small-bar rounded-bar tertiary-bar p-0'>
        <Row as='section' className='m-0 px-3 flex-column mb-5'>
          <Box
            className={`edit-buttons-container ${isEditing ? 'enlarge' : ''} ${
              passedThreshold ? 'add-background' : ''
            }`}>
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
              @{username}
            </Col>
            <Col as='span' className='status p-0 px-3 d-block'>
              {/* <CreateOutlinedIcon className='mr-2' /> */}
              Currently creating some amazing sturvs...
            </Col>
          </Col>
        </Row>

        <Row as='section' className='info-rows-container m-0'>
          <Col md={6} className='info-card-container py-0'>
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

          <Col md={6} className='info-card-container py-0'>
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

export default Profile;
