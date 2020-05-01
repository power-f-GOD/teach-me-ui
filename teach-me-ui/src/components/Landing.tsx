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

const tempText = `Mauris neque quam, fermentum ut nisl vitae, convallis maximus
nisl. Sed mattis nunc id lorem euismod placerat. Vivamus
porttitor magna enim, ac accumsan tortor cursus at. Phasellus
sed ultricies mi non congue ullam corper. Praesent tincidunt
sed tellus ut rutrum. Sed vitae justo condimentum, porta
lectus vitae, ultricies congue gravida diam non fringilla.`;

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
  ],
  forClipArt: [
    {
      key: 1,
      heading: 'Vivamus',
      text: tempText
    },
    {
      key: 2,
      heading: 'Corper',
      text: tempText
    },
    {
      key: 3,
      heading: 'Justo',
      text: tempText
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
                  Welcome to Teach Me!
                </Typography>
                <br />
                <Typography component='span' variant='h6'>
                  An online Community where Students, Lecturers, Academics,
                  Universities converge!
                </Typography>
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
          {mockData.forClipArt.map((item: any, key: number) => (
            <ClipArtWithText item={item} key={key} />
          ))}
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
          <Box className='text-section-row text-section-last'>
            <Container className='text-section-container'>
              <Box>
                <Typography component='h3' variant='h4'>
                  Fermentum
                </Typography>
                <hr />
                <Box component='span'>{mockData.forClipArt[0].text}</Box>
              </Box>
            </Container>
          </Box>
          <Box className='card-section-row card-section-last-box'>
            <Container className='card-section-container'>
              {mockData.forCard.map((item: any, key: number) =>
                key > 0 ? (
                  <CardComponent item={item} key={key} className='card-below' />
                ) : null
              )}
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
          {/card-below/.test(className) && <Box className='card-link-box'><Link to='/#!' className='outlined'>Link</Link></Box>}
        </Box>
      </CardContent>
    </Card>
  );
}

function ClipArtWithText(props: any) {
  const { heading, text, key } = props.item;

  return (
    <Box className='text-section-row'>
      <Container className='text-section-container'>
        <Box className={`text-section-box clip-art-box-${key}`}></Box>
        <Box className={`text-section-box clip-art-text-${key}`}>
          <Typography component='h3' variant='h4'>
            {heading}
          </Typography>
          <Box component='span'>{text}</Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Landing;
