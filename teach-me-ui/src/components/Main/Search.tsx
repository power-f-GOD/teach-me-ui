import React, { useCallback, useRef } from 'react';
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
import LinearProgress from '@material-ui/core/LinearProgress';

import { ColleagueData } from '../../constants/interfaces';
import { dispatch } from '../../functions/utils';
import { triggerSearchKanyimuta } from '../../actions/search';

const Search = (props: any) => {
  const searchInputRef = useRef<HTMLInputElement>();
  const { searchKanyimuta } = props;
  const results: ColleagueData[] | any[] = searchKanyimuta.data;

  const handleSearchChange = useCallback((e: any) => {
    dispatch(triggerSearchKanyimuta(e.target.value.trim())(dispatch));
  }, []);

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
                inputRef={searchInputRef}
                inputProps={{ 'aria-label': 'search' }}
                onChange={handleSearchChange}
              />
            </Box>
          </Row>

          <Box
            className={`loader-container mt-3 ${
              searchKanyimuta.status === 'pending' ? '' : 'hide'
            }`}>
            <LinearProgress color='primary' />
          </Box>

          {!results[0] ? (
            <Box
              className='d-flex align-items-center justify-content-center'
              marginY='4rem'
              color='#aaa'
              textAlign='center'
              fontSize='1.5rem'>
              <SearchIcon fontSize='large' />{' '}
              <span>
                {searchKanyimuta.status === 'fulfilled'
                  ? 'Searched and found nothing'
                  : searchKanyimuta.status === 'pending'
                  ? 'Making search...'
                  : 'Search Kanyimuta...'}
              </span>
            </Box>
          ) : (
            <List
              className={`search-results-wrapper custom-scroll-bar`}
              aria-label='search results'>
              {results.slice(0, 20).map((result, key) => (
                <ListItem button divider key={key} className='search-result'>
                  {(() => {
                    const keyword = searchInputRef.current?.value ?? '';
                    let username = `@${result.username}`;
                    const link = `/${username}`;
                    let displayName = `${result.firstname} ${result.lastname}`.replace(
                      new RegExp(`(${keyword.trim()})`, 'i'),
                      `<span class='theme-secondary-darker'>$1</span>`
                    );
                    username = username.replace(
                      new RegExp(`(${keyword.trim()})`, 'i'),
                      `<span class='theme-secondary-darker'>$1</span>`
                    );
                    const person = `
                    <div class='display-name'>${displayName}</div>
                    <div class='username'>${username}</div>
                    <div class='department'>${result.department}</div>`;

                    return (
                      <Link to={link} className='d-flex'>
                        <Avatar
                          component='span'
                          className='profile-avatar'
                          alt={'P'}
                          src={`/images/${result.avatar ?? ''}`}
                        />
                        <div
                          className=''
                          dangerouslySetInnerHTML={{
                            __html: person
                          }}></div>
                      </Link>
                    );
                  })()}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Container>
    </Box>
  );
};

const mapStateToProps = ({ searchKanyimuta }: any) => ({ searchKanyimuta });

export default connect(mapStateToProps)(Search);
