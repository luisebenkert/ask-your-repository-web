// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import ImageService from '../../services/ImageService';
import EvaluationService from '../../services/EvaluationService';
import ImageDecorator from '../images/gallery/ImageDecorator';
import Button from '../utility/buttons/Button';
import './Evaluation.scss';

const evaluationSet = [
  {
    searchterms: ['horse'],
    ranking: [],
  },
  {
    searchterms: ['mountains'],
    ranking: [],
  },
  {
    searchterms: ['hiking', 'mountains'],
    ranking: [],
  },
];

const SortableItem = SortableElement(({ value, showDisabled }) => {
  return (
    <div className="ImageSlide__item">
      <img
        className={'ImageSlide__item__image ' + (showDisabled ? 'ImageSlide__item__image__disabled' : '')}
        src={value.url}
      />
      <button
        id={value.id}
        type="button"
        className="ImageSlide__item__button"
      >
        x
      </button>
    </div>
  );
});

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

class Evaluation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      originals: [],
      images: [],
      disabled: [],
      searchterms: evaluationSet[0].searchterms,
      currentIndex: 1,
      length: evaluationSet.length,
      end: false,
    };
  }

  componentDidMount() {
    this.loadMoreImages();
  }

  initialize = () => {
    this.setState(prevState => ({
      images: prevState.originals,
      disabled: [],
    }));
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

  getDiff = (a, b) => a.filter(i => b.indexOf(i) < 0);

  getIndices = (images) => {
    const result = [];
    images.forEach((item) => {
      result.push(item.id);
    });
    return result;
  }

  submitRanking = () => {
    const {
      currentIndex,
      length,
      images,
      disabled,
    } = this.state;

    const indices = this.getIndices(images);
    const diff = this.getDiff(indices, disabled);

    evaluationSet[currentIndex - 1].ranking = diff;
    console.log(evaluationSet);

    if (currentIndex < length) {
      this.setState(prevState => ({
        searchterms: evaluationSet[currentIndex].searchterms,
        currentIndex: prevState.currentIndex + 1,
      }));
      this.initialize();
    } else {
      this.setState({
        end: true,
      });
      EvaluationService.post(evaluationSet);
    }
  }

  loadMoreImages = async () => {
    const { activeTeam } = this.props;

    if (!activeTeam) return;

    try {
      const params = {
        teamId: activeTeam.id,
      };
      const images = await ImageService.list(params);
      this.receiveImages(images);
    } catch (error) {
      // TODO: Handle error
    }
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
      images,
      disabled,
      searchterms,
      end,
    } = this.state;

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {end
          ? (
            <div className="Evaluation__thankYou">
              Thank you for participating.
            </div>
          )
          : (
            <div className="Evaluation">
              <div className="Evaluation__toolbar">
                <div className="Evaluation__toolbar__title">
                  Search Terms:
                </div>
                <div className="Evaluation__toolbar__searchTerms">
                  {searchterms.map(item => (
                    <p key={item}>{item.toUpperCase()}</p>
                  ))}
                </div>
                <Button
                  className="Evaluation__toolbar__submit"
                  onClick={this.submitRanking}
                >
                  Submit
                </Button>
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

export default connect(mapStateToProps)(Evaluation);
