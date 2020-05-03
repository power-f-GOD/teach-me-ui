import React from 'react';
import { Link } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ForumRoundedIcon from '@material-ui/icons/ForumRounded';
import LibraryBooksRoundedIcon from '@material-ui/icons/LibraryBooksRounded';
import SchoolRoundedIcon from '@material-ui/icons/SchoolRounded';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowForward from '@material-ui/icons/ArrowForwardIosSharp';

let mockData: any = {
  forCard: [
    {
      icon: ForumRoundedIcon,
      heading: 'Lorem',
      text:
        'Consectetur adipisicing elit. Praesentium magnam consectetur vel in deserunt aspernatur est reprehenderit sunt hic.'
    },
    {
      icon: LibraryBooksRoundedIcon,
      heading: 'Ipsum',
      text:
        'Praesent tincidunt sed tellus ut rutrum. Sed vitae justo condimentum, porta lectus vitae, ultricies congue gravida diam non fringilla.'
    },
    {
      icon: SchoolRoundedIcon,
      heading: 'Dolor',
      text:
        'Sed mattis nunc id lorem euismod placerat. Vivamus porttitor magna enim, ac accumsan tortor cursus at.'
    }
  ]
};

const Landing = () => {
  return (
    <Box className='fade-in'>
      <Box component='main' className='landing-main-box'>
        <Box component='section' className='landing-splash-box'>
          <Container className='landing-splash-container'>
            <Grid container direction='column'>
              <Box maxWidth='35rem'>
                <Typography component='h2' variant='h3'>
                  Welcome to Kanyimuta!
                </Typography>
                <br />
                <Box fontSize='1.05em'>
                  The online Community (for learning) where Students, Lecturers, Academics,
                  Universities converge!
                </Box>
              </Box>
              <br />
              <Box className='landing-splash-links-box'>
                <Link to='/signup' className='Primary'>
                  JOIN NOW <ArrowForward fontSize='inherit' />
                </Link>
                <Link to='/about'>LEARN MORE</Link>
              </Box>
            </Grid>
          </Container>
        </Box>

        <Box component='section' className='landing-text-section'>
          <Box className='card-section-row'>
            <Container className='card-section-container'>
              {mockData.forCard.map((item: any, key: number) => (
                <CardComponent item={item} key={key} />
              ))}
            </Container>
          </Box>
          <Box className='text-section-row avatars-box'>
            <Container className='text-section-container avatars-box-header-container'>
              <Box>
                <Typography
                  className='avatars-box-header'
                  component='h3'
                  variant='h4'>
                  Erectus
                </Typography>
              </Box>
            </Container>
            <Container className='text-section-container'>
              <Box className='text-section-box'>
                <Box className='avatar-medium'></Box>
                <Box className='avatar-small'></Box>
              </Box>
              <Box className='text-section-box'>
                <Box className='avatar-small'></Box>
                <Box className='avatar-medium'></Box>
              </Box>
            </Container>
          </Box>
          <Box className='text-section-row'>
            <Container className='text-section-container'>
              <Box className='text-section-box'></Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

function CardComponent(props: any) {
  const { icon: Icon, heading, text } = props.item;
  const { className } = props;

  return (
    <Card className={className ?? ''}>
      <CardContent>
        <Box className='icon-box'>
          <Icon className='icon-large' />
        </Box>
        <Box className='card-header-box'>
          <Typography component='h3' variant='h4'>
            {heading}
          </Typography>
          <hr />
        </Box>
        <Box>
          {text}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Landing;
