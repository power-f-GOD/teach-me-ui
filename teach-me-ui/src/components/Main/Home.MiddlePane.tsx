import React from 'react';

import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import Post from '../crumbs/Post';
import Compose from '../crumbs/Compose';

import { PostPropsState } from '../../constants/interfaces';

const MiddlePane = () => {
  return (
    <Container className='middle-pane' fluid>
      <Compose />
      {posts.map((post: PostPropsState, i: number) => (
        <Post {...post} key={i} />
      ))}
    </Container>
  );
};

const posts: Array<PostPropsState> = [
  {
    displayName: 'Benjamin Chibuzor-Orie',
    downvotes: 2450,
    upvotes: 7134561,
    noOfComments: 45271,
    username: 'iambenkay',
    postBody:
      'Where do people go when they die? Same place they were before they were born!',
    userAvatar: 'avatar-2.png',
    reaction: 'downvote'
  },
  {
    displayName: 'Emmanuel Sunday',
    downvotes: 22234,
    upvotes: 90134561,
    noOfComments: 25271900,
    username: 'emmasunday',
    postBody:
      'To be successful, you have to use each day as an opportunity to improve, to be better, to get a little bit closer to your goals. It might sound like a lot of work—and with a busy schedule, next to impossible. But the best part is, the more you accomplish, the more you’ll want to do, the higher you’ll want to reach.',
    userAvatar: 'avatar-2.png',
    reaction: 'upvote'
  },
  {
    displayName: 'Power Sunday',
    downvotes: 50,
    upvotes: 1567234800,
    noOfComments: 124587236,
    username: 'powerfgod',
    postBody:
      'Leopold II was King of the Belgians from 1865 to 1909 and, in a completely separate role, the Sovereign of the Congo Free State from 1885 to 1908. During his absolute rule of the Congo, an estimated 10–15 million Africans died and conditions there led to an early use of the term "crime against humanity."',
    userAvatar: 'avatar-2.png',
    reaction: 'neutral'
  }
];

export default MiddlePane;
