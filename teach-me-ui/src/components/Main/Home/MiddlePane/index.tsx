import React from 'react';
import { connect } from 'react-redux';

import { PostStateProps, UserData, FetchState } from '../../../../types';
import { POSTS_ANCHOR__HOME } from '../../../../constants';
import Feeds from '../../../shared/Feeds';

interface HomeMiddlePaneProps {
  posts: FetchState<PostStateProps[]>;
  recommendations: FetchState<UserData[]>;
}

const HomeMiddlePane = (props: HomeMiddlePaneProps) => {
  const { posts, recommendations } = props;

  return (
    <Feeds
      anchor={POSTS_ANCHOR__HOME}
      anchorPosts={posts}
      recommendations={recommendations}
    />
  );
};

const mapStateToProps = (state: HomeMiddlePaneProps) => ({
  posts: state.posts,
  recommendations: state.recommendations
});

export default connect(mapStateToProps)(HomeMiddlePane);
