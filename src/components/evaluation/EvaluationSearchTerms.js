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

class EvaluationSearchTerms extends Component {
  constructor(props) {
    super(props);

    console.log(props);

    this.state = {
      result: [],
      originals: [],
      currentIndex: 0,
      currentInput: '',
      searchterms: [],
      error: '',
      showModal: false,
      testSet: props.location.state.testSet,
    };
  }

  componentDidMount() {
    this.loadMoreImages();
  }

  finishEvaluation = () => {
    const {
      result,
    } = this.state;

    EvaluationService.post({
      type: 'search_terms',
      set: result,
    });
  }

  loadMoreImages = async () => {
    const { testSet } = this.state;

    if (!testSet) return;

    try {
      const params = {
        teamId: testSet.team_id,
      };
      const images = await ImageService.list(params);
      this.receiveImages(images);
    } catch (error) {
      // TODO: Handle error
    }
  };

  nextImage = () => {
    this.setState(prevState => ({
      currentIndex: prevState.currentIndex + 1,
    }));
  }

  handleChange = (event) => {
    this.setState({
      currentInput: event.target.value,
    });
  };

  handleEnter = (event) => {
    if (event.key === 'Enter') {
      this.setState(prevState => ({
        searchterms: [prevState.currentInput, ...prevState.searchterms],
        currentInput: '',
        error: false,
      }));
    }
  };

  submitSearchTerms = () => {
    const { originals, currentIndex, searchterms } = this.state;
    this.setState(prevState => ({
      result: [...prevState.result, {
        image: originals[currentIndex].id,
        searchterms,
      }],
      currentIndex: prevState.currentIndex + 1,
      searchterms: [],
      currentInput: '',
      error: '',
      showModal: false,
    }), () => {
      if (this.state.currentIndex >= originals.length) {
        this.finishEvaluation();
      }
    });
  }

  closeModal = () => {
    this.setState({
      showModal: false,
    });
  }

  onSubmit = () => {
    const { originals, currentIndex, searchterms } = this.state;
    if (searchterms.length < 1) {
      this.setState({
        error: 'Please add at least one search term.',
      });
    } else {
      this.setState({
        showModal: true,
      });
    }
  }

  removeSearchTerm = (item) => {
    this.setState(prevState => ({
      searchterms: prevState.searchterms.filter(element => element !== item),
    }));
  }

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
      originals,
      currentIndex,
      currentInput,
      searchterms,
      error,
      showModal,
    } = this.state;

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {showModal && (
          <ConfirmModal
            onCancel={this.closeModal}
            onContinue={this.submitSearchTerms}
          >
            <div> Are you sure you want to submit? </div>
          </ConfirmModal>
        )}
        {currentIndex >= originals.length
          ? (
            <EvaluationEndScreen />
          )
          : (
            <div className="EvaluationSearchTerms">
              <div className="EvaluationSearchTerms__toolBar">
                <div className="EvaluationSearchTerms__toolBar__title">
                  Search Terms
                </div>
                <input
                  type="text"
                  value={currentInput}
                  onChange={this.handleChange}
                  onKeyDown={this.handleEnter}
                  className="EvaluationSearchTerms__toolBar__input"
                />
                <div className="EvaluationSearchTerms__toolBar__searchTerms">
                  {searchterms.map(item => (
                    <Button
                      className="EvaluationSearchTerms__toolBar__searchTerms__item"
                      onClick={() => this.removeSearchTerm(item)}
                      key={item}
                    >
                      <span className="EvaluationSearchTerms__toolBar__searchTerms__item__text">
                        {item}
                      </span>
                    </Button>
                  ))}
                </div>
                <Button
                  className="EvaluationSearchTerms__toolBar__submit"
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
              <div className="EvaluationSearchTerms__imageBar">
                {originals.length > 0 && (
                  <img
                    className="EvaluationSearchTerms__imageBar__item"
                    src={originals[currentIndex].url}
                    alt={originals[currentIndex].id}
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

export default connect(mapStateToProps)(EvaluationSearchTerms);
