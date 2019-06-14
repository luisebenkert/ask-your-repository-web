// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import arrayMove from 'array-move';
import ImageService from '../../services/ImageService';
import EvaluationService from '../../services/EvaluationService';
import ImageDecorator from '../images/gallery/ImageDecorator';
import Button from '../utility/buttons/Button';
import ConfirmModal from '../utility/ConfirmModal';
import EvaluationEndScreen from './EvaluationEndScreen';
import './Evaluation.scss';

class EvaluationRelevance extends Component {
  constructor(props) {
    super(props);

    const { testSet } = props.location.state;

    const result = [];
    testSet.test_words.forEach((item) => {
      result.push({
        [item]: {},
      });
    });

    console.log(testSet);
    this.state = {
      testSet,
      result: [],
      images: [],
      imageIndex: 0,
      searchtermIndex: 0,
      searchterms: testSet.test_words,
    };
  }

  componentDidMount() {
    this.loadAllImages();
  }

  finishEvaluation = () => {
    const {
      testSet,
      result,
    } = this.state;

    EvaluationService.post({
      name: testSet.name,
      type: 'relevance',
      set: result,
    });
  }

  loadAllImages = async () => {
    const { testSet } = this.state;

    if (!testSet) return;

    try {
      const params = {
        teamId: testSet.team_id,
        offset: 0,
        limit: 1000,
      };
      const images = await ImageService.list(params);
      this.receiveImages(images);
    } catch (error) {
      // TODO: Handle error
    }
  };

  onSubmit = (ranking) => {
    const {
      result,
      searchterms,
      searchtermIndex,
      images,
      imageIndex,
    } = this.state;

    const currentSearchterm = searchterms[searchtermIndex];
    const currentImage = images[imageIndex];

    if (!currentImage) {
      return;
    }

    const imageId = currentImage.id.toString();

    this.setState(prevState => ({
      result: {
        ...prevState.result,
        [currentSearchterm]: {
          ...prevState.result[currentSearchterm],
          [imageId]: ranking,
        },
      },
      imageIndex: prevState.imageIndex + 1 >= images.length
        ? 0
        : prevState.imageIndex + 1,
      searchtermIndex: prevState.imageIndex + 1 >= images.length
        ? prevState.searchtermIndex + 1
        : prevState.searchtermIndex,
    }));
  }

  receiveImages(fetchedImages) {
    const decoratedImages = fetchedImages.map(
      image => ImageDecorator.decorateImage(image),
    );
    this.setState(state => ({
      images: [...state.images, ...decoratedImages],
    }));
    this.initialize();
  }

  render() {
    const {
      images,
      imageIndex,
      searchtermIndex,
      searchterms,
    } = this.state;

    console.log(imageIndex);
    console.log(images.length);

    console.log(searchtermIndex);
    console.log(searchterms.length);

    if (searchtermIndex >= searchterms.length) {
      this.finishEvaluation();
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {searchtermIndex >= searchterms.length
          ? (
            <EvaluationEndScreen />
          )
          : (
            <div className="EvaluationRelevance">
              <div className="EvaluationRelevance__toolbar">
                <div className="EvaluationRelevance__toolbar__title">
                  How relevant is this image for the search term:
                </div>
                <div className="EvaluationRelevance__toolbar__searchTerms">
                  {searchterms[searchtermIndex].map(item => (
                    <p key={item}>
                      {item.toUpperCase()}
                    </p>
                  ))}
                </div>
                <div className="EvaluationRelevance__toolbar__rating">
                  <Button
                    className="EvaluationRelevance__toolbar__rating__button EvaluationRelevance__toolbar__rating__button__green"
                    onClick={() => this.onSubmit(3)}
                  >
                    3 - Highly relevant
                  </Button>
                  <Button
                    className="EvaluationRelevance__toolbar__rating__button EvaluationRelevance__toolbar__rating__button__yellow"
                    onClick={() => this.onSubmit(2)}
                  >
                    2 - Somewhat relevant
                  </Button>
                  <Button
                    className="EvaluationRelevance__toolbar__rating__button EvaluationRelevance__toolbar__rating__button__red"
                    onClick={() => this.onSubmit(1)}
                  >
                    1 - Not relevant
                  </Button>
                </div>
              </div>
              <div className="EvaluationSearchTerms__imageBar">
                {images.length > 0 && (
                  <img
                    className="EvaluationSearchTerms__imageBar__item"
                    src={images[imageIndex].url}
                    alt={images[imageIndex].id}
                  />
                )}
              </div>
            </div>
          )
        }
      </div>
    );
  }
}


const mapStateToProps = state => ({
  activeTeam: state.activeTeam,
});

export default connect(mapStateToProps)(EvaluationRelevance);
