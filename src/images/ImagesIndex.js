// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import Gallery from './Gallery';
import ImageService from '../services/ImageService';
import type { Artifact } from '../models/Artifact';
import type { AppState } from '../state/AppState';
import './ImagesIndex.scss';

type Props = {
  dispatch: Function,
  images: Array<Artifact>,
};

type State = {
  offset: number,
  endReached: boolean,
};

const limit = 5;

class ImagesIndex extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      offset: 0,
      endReached: false,
    };
  }

  componentDidMount() {
    this.loadMoreImages();
  }

  handleLoadMore = () => { this.loadMoreImages(); };

  async loadMoreImages() {
    if (this.state.endReached) return;

    const { dispatch } = this.props;
    const { offset } = this.state;

    try {
      const images = await dispatch(ImageService.list(offset, limit));

      if (images.length > 0) {
        this.setState({ offset: offset + limit });
      } else {
        this.setState({ endReached: true });
      }
    } catch (error) {
      // TODO: Handle error
    }
  }

  render() {
    const { images } = this.props;

    if (!images.length) {
      return null;
    }

    return (
      <div className="ImagesPage">
        <div className="IndexView">
          <InfiniteScroll
            hasMore={!this.state.endReached}
            loadMore={this.handleLoadMore}
          >
            <Gallery artifacts={images} />
          </InfiniteScroll>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  images: state.images,
});

export default connect(mapStateToProps)(ImagesIndex);