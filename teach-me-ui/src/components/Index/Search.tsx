import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

const Search = () => {
  const results: string[] = ['@powerofgod', '@nuelsoft', '@iambenkay'];

  return (
    <Box className='Search fade-in' paddingY='4.5rem'>
      <Container className='d-flex flex-column justify-content-center'>
        <Box className='search-container mx-auto'>
          <Row className='search-box d-flex w-100 mx-0'>
            <SearchIcon />
            <Box className='search-input-wrapper'>
              <InputBase
                placeholder='Search…'
                className='search-input'
                inputProps={{ 'aria-label': 'search' }}
              />
            </Box>
          </Row>

          <List
            className={`search-results-wrapper custom-scroll-bar`}
            aria-label='search results'>
            {results.slice(0, 15).map((result, key) => (
              <ListItem
                button
                divider
                key={key}
                className='search-result'
                // onClick={() => {
                //   setChoice(result);
                // }}
              >
                {(() => {
                  const link = `/profile/${result}`;
                  const keyword = result.trim();
                  // const highlighted = `${_institution.name.replace(
                  //   new RegExp(`(${keyword})`, 'i'),
                  //   `<span class='theme-secondary-darker'>$1</span>`
                  // )}, ${country}`.replace(/<\/?script>/gi, '');
                  const highlighted = `
                    <div class='display-name'>John Doe</div>
                    <div class='username'>${keyword}</div>
                    <div class='department'>Computer Science</div>`;

                  return (
                    <Link to={link} className='d-flex'>
                      <Avatar
                        component='span'
                        className='profile-avatar'
                        alt={'P'}
                        src={`/images/${''}`}
                      />
                      <div
                        className=''
                        dangerouslySetInnerHTML={{
                          __html: highlighted
                        }}></div>
                    </Link>
                  );
                })()}
              </ListItem>
            ))}
          </List>
        </Box>
      </Container>
    </Box>
  );
};

const mapStateToProps = ({ searchResults }: any) => ({ searchResults });

export default connect(mapStateToProps)(Search);
