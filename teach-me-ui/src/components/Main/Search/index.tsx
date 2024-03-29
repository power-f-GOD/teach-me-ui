import React, { useCallback, createRef } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import queryString from 'query-string';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import LinearProgress from '@material-ui/core/LinearProgress';

import { ColleagueData } from '../../../types';
import { dispatch } from '../../../utils';
import { triggerSearchKanyimuta } from '../../../actions/main/search';
import { KAvatar } from '../../shared';

const searchBoxRef = createRef<HTMLInputElement>();
const searchInputRef = createRef<HTMLInputElement>();

let searchTimeout: any = null;
let searchBox: any = searchBoxRef.current;

const Search = (props: any) => {
  const { searchKanyimuta, location } = props;
  const results: ColleagueData[] | any[] = searchKanyimuta.data;
  const query = queryString.parse(location.search).q ?? '';
  const searchInput = searchInputRef.current;

  searchBox = searchBoxRef.current;

  const handleSearchChange = useCallback(
    (e: any) => {
      const value = e.target.value;

      searchBox = searchBoxRef.current;

      if (value) {
        searchBox?.classList.add('transform');
      } else {
        searchBox?.classList.remove('transform');
      }

      //attempt to clear state before making search
      dispatch(triggerSearchKanyimuta('')(dispatch));

      clearTimeout(searchTimeout);
      window.history.replaceState({}, '', location.pathname + `?q=${value}`);
      searchTimeout = setTimeout(
        () => {
          dispatch(triggerSearchKanyimuta(value.trim())(dispatch));
        },
        value ? 750 : 0
      );
    },
    [location.pathname]
  );

  React.useEffect(() => {
    if (searchInput) {
      if (!searchInput.value.trim()) {
        searchInput.value = query ?? '';
      }
    }

    setTimeout(() => {
      if (query) {
        if (searchBox) {
          searchBox.classList.add('transform');
        }

        dispatch(triggerSearchKanyimuta(query)(dispatch));
        window.history.replaceState({}, '', location.pathname + `?q=${query}`);
      }
    }, 750);

    return () => {
      dispatch(triggerSearchKanyimuta('')(dispatch));
    };
  }, [query, location.pathname, searchInput]);

  return (
    <Box className='Search fade-in'>
      <Container className='d-flex flex-column justify-content-center p-0'>
        <Box className='search-container mx-auto'>
          <Row
            ref={searchBoxRef as any}
            className='search-box d-flex w-100 mx-0'>
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
            className={`loader-container mt-3 mb-2 ${
              searchKanyimuta.status === 'pending' ? '' : 'hide'
            }`}>
            <LinearProgress color='primary' />
          </Box>

          {!results[0] ? (
            <Box
              className='no-results-wrapper d-flex align-items-center justify-content-center'
              marginY='4rem'
              color='#aaa'
              textAlign='center'
              fontSize='1.5rem'>
              <SearchIcon fontSize='large' />{' '}
              <span>
                {searchKanyimuta.status === 'fulfilled'
                  ? 'Found nothing. :/'
                  : searchKanyimuta.status === 'pending'
                  ? 'Searching... ;)'
                  : searchKanyimuta.err
                  ? 'An error occurred. :('
                  : 'Search Kanyimuta'}
              </span>
            </Box>
          ) : (
            <List
              className={`search-results-wrapper custom-scroll-bar tertiary-bar rounded-bar`}
              aria-label='search results'>
              {results.slice(0, 20).map((result, key) => (
                <ListItem button divider key={key} className='search-result'>
                  {(() => {
                    const keyword = searchInputRef.current?.value ?? '';
                    let username = `@${result.username}`;
                    const link = `/${username}`;
                    let displayName = `${result.first_name} ${result.last_name}`.replace(
                      new RegExp(`(${keyword.trim()})`, 'i'),
                      `<span class='theme-secondary-lighter'>$1</span>`
                    );
                    username = username.replace(
                      new RegExp(`(${keyword.trim()})`, 'i'),
                      `<span class='theme-secondary-lighter'>$1</span>`
                    );
                    const person = `
                    <div class='display-name'>${displayName}</div>
                    <div class='username'>${username}</div>
                    <div class='department'>${result.department}</div>`;

                    return (
                      <Link to={link} className='d-flex'>
                        <KAvatar
                          className='profile-avatar'
                          alt={'P'}
                          src={result.profile_photo ? result.profile_photo : `/images/${result.avatar ?? ''}`}
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
