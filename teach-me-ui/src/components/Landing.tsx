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
      img: 'worldwide-education.png',
      heading: 'Connect',
      text:
        'Connect with the best academic intellects from universities around the world.'
    },
    {
      icon: LibraryBooksRoundedIcon,
      img: 'group-education.png',
      heading: 'Share',
      text:
        'Create topics, discussions on any subject matter and learn from top and world-class Academia.'
    },
    {
      icon: SchoolRoundedIcon,
      img: 'light-bulb-education.png',
      heading: 'Learn',
      text:
        'With access to a worldwide network of Academics, see your IQ and skill capacity increase rapidly with getting the right knowledge and information.'
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
                  The online Community where Students, Lecturers, Academics,
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
        </Box>
      </Box>
    </Box>
  );
};

function CardComponent(props: any) {
  const { heading, text, img } = props.item;
  const { className } = props;

  return (
    <Card className={className ?? ''}>
      <CardContent>
        <Box className='icon-box'>
          <img className='card-image' src={`/images/${img}`} alt={heading} />
        </Box>
        <Box className='card-header-box'>
          <Typography component='h3' variant='h4'>
            {heading}
          </Typography>
          <hr />
        </Box>
        <Box>{text}</Box>
      </CardContent>
    </Card>
  );
}

export default Landing;
