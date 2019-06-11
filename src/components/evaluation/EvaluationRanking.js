// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import ImageService from '../../services/ImageService';
import EvaluationService from '../../services/EvaluationService';
import ImageDecorator from '../images/gallery/ImageDecorator';
import Button from '../utility/buttons/Button';
import ConfirmModal from '../utility/ConfirmModal';
import EvaluationEndScreen from './EvaluationEndScreen';
import './Evaluation.scss';

const SortableItem = SortableElement(({ value, showDisabled }) => (
  <div className="ImageSlide__item">
    <img
      className={'ImageSlide__item__image ' + (showDisabled ? 'ImageSlide__item__image__disabled' : '')}
      src={value.url}
      alt={value.url}
    />
    <button
      id={value.id}
      type="button"
      className="ImageSlide__item__button"
    >
      x
    </button>
  </div>
));

const SortableList = SortableContainer(({ items, disabled }) => {
  return (
    <div className="ImageSlide">
      {items.map((value, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          value={value}
          showDisabled={disabled.includes(value.id)}
        />
      ))}
    </div>
  );
});

class EvaluationRanking extends Component {
  constructor(props) {
    super(props);

    const testSet = props.location.state.testSet;

    const result = [];
    testSet.test_words.forEach((item) => {
      result.push({
        searchterms: item,
        ranking: [],
      });
    });

    this.state = {
      originals: [],
      images: [],
      disabled: [],
      testSet,
      allSearchterms: testSet.test_words,
      currentIndex: 0,
      length: testSet.test_words.length,
      error: '',
      showModal: false,
      result,
    };
  }

  componentDidMount() {
    this.loadAllImages();
  }

  initialize = () => {
    this.setState(prevState => ({
      images: prevState.originals,
      disabled: [],
    }));
  }

  finishEvaluation = () => {
    const {
      testSet,
      result,
    } = this.state;

    EvaluationService.post({
      name: testSet.name,
      type: 'ranking',
      set: result,
    });
  }

  loadAllImages = async () => {
    const { testSet } = this.state;
    let length = Infinity;
    const allImages = [];
    
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

  getDiff = (a, b) => a.filter(i => b.indexOf(i) < 0);

  getRankingIndices = (images) => {
    const result = [];
    images.forEach((item) => {
      result.push(item.id);
    });
    return result;
  }

  submitRanking = () => {
    const {
      currentIndex,
      result,
      disabled,
      images,
      length,
    } = this.state;

    const ranking = this.getRankingIndices(images);
    const diff = this.getDiff(ranking, disabled);

    result[currentIndex].ranking = diff;

    this.setState(prevState => ({
      result,
      currentIndex: prevState.currentIndex + 1,
      error: '',
      showModal: false,
    }), () => {
      if (this.state.currentIndex >= length) {
        this.finishEvaluation();
      }
    });

    this.initialize();
  }

  closeModal = () => {
    this.setState({
      showModal: false,
    });
  }

  onSubmit = () => {
    // TODO if nothing was done
    if (false) {
      this.setState({
        error: 'Please do something.',
      });
    } else {
      this.setState({
        showModal: true,
      });
    }
  }

  disableImage = (index) => {
    if (this.state.disabled.includes(index)) {
      this.setState(prevState => ({
        disabled: prevState.disabled.filter(e => e !== index),
      }));
      return false;
    }
    this.setState(prevState => ({
      disabled: [...prevState.disabled, index],
    }));
    return true;
  };

  resortImages = ({ oldIndex, newIndex }) => {
    this.setState(({ images }) => ({
      images: arrayMove(images, oldIndex, newIndex),
    }));
  };

  receiveClick = (e) => {
    if (e.target.tagName === 'BUTTON') {
      const { images } = this.state;
      const { id } = e.target;
      const nowDisabled = this.disableImage(id);
      const { length } = images;

      const oldIndex = images.findIndex(item => item.id === id);
      this.resortImages({
        oldIndex,
        newIndex: nowDisabled ? length : 0,
      });
    }
    return false;
  };

  receiveImages(fetchedImages) {
    const decoratedImages = fetchedImages.map(
      image => ImageDecorator.decorateImage(image),
    );
    this.setState(state => ({
      originals: [...state.originals, ...decoratedImages],
    }));
    this.initialize();
  }

  render() {
    const {
      disabled,
      images,
      currentIndex,
      allSearchterms,
      showModal,
      error,
      length,
    } = this.state;

    console.log(images);

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {showModal && (
          <ConfirmModal
            onCancel={this.closeModal}
            onContinue={this.submitRanking}
          >
            <div> Are you sure you want to submit? </div>
          </ConfirmModal>
        )}
        {currentIndex >= length
          ? (
            <EvaluationEndScreen />
          )
          : (
            <div className="EvaluationRanking">
              <div className="EvaluationRanking__toolbar">
                <div className="EvaluationRanking__toolbar__title">
                  Search Terms:
                </div>
                <div className="EvaluationRanking__toolbar__searchTerms">
                  {allSearchterms[currentIndex].map(item => (
                    <p key={item}>{item.toUpperCase()}</p>
                  ))}
                </div>
                <Button
                  className="EvaluationRanking__toolbar__submit"
                  onClick={this.onSubmit}
                >
                  Submit
                </Button>
                {error !== '' && (
                  <p className="Evaluation__error">
                    {error}
                  </p>
                )}
              </div>
              <SortableList
                items={images}
                onSortEnd={this.resortImages}
                disabled={disabled}
                shouldCancelStart={this.receiveClick}
              />
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

export default connect(mapStateToProps)(EvaluationRanking);
