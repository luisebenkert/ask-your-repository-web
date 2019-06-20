import React, { Component } from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import EvaluationService from '../../services/EvaluationService';
import loading from '../../assets/loading.gif';
import './Evaluation.scss';

class EvaluationAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pipelines: 7,
      files: props.location.state.files,
      testSetName: props.location.state.testSet.name,
      teamId: props.location.state.testSet.team_id,
      searchterms: props.location.state.testSet.test_words,
      searchtermsLength: props.location.state.testSet.test_words.length,
      searchDict: {},
      searchDictInsertions: 0,
      maxSearchDictInsertions: props.location.state.testSet.test_words.length * 7,
    };
  }

  async componentDidMount() {
    // this.combineFiles();
    this.setupSearchDict();
    console.log(this.state.maxSearchDictInsertions);
  }

  componentDidUpdate() {
    console.log(this.state.searchDict);
    console.log(this.state.searchDictInsertions);
  }

  setupSearchDict = async () => {
    const { pipelines, searchterms } = this.state;
    const searchDictLocal = {};

    for (let i = 0; i < pipelines; i += 1) {
      searchDictLocal[i] = {};
      searchterms.forEach((element) => {
        const nameString = element.join(',');
        searchDictLocal[i][nameString] = {};
      });
    }

    this.setState({
      searchDict: searchDictLocal,
    }, () => {
      this.searchDatabase();
    });
  }

  searchDatabase = () => {
    const { searchDict } = this.state;
    Object.keys(searchDict).forEach((pipelineNumber) => {
      const pipeline = searchDict[pipelineNumber];
      Object.keys(pipeline).forEach((searchTerm) => {
        this.searchByKeywords(searchTerm, pipelineNumber);
      });
    });
  };

  searchByKeywords = async (keywords, pipeline) => {
    const { teamId } = this.state;
    const search = keywords.split(',');
    console.log(search);
    console.log(pipeline);
    const searchResult = await EvaluationService.get({
      search,
      teamId,
      limit: 1000,
      offset: 0,
      pipeline,
    });

    const filteredImages = searchResult.images.filter(image => image.score === undefined || image.score > 0);

    this.fillSearchDict(pipeline, keywords, filteredImages);
  };

  processSearchResult = (images) => {
    const processedImages = {};

    images.forEach((imageElement) => {
      const { id, score } = imageElement;
      processedImages[id] = score;
    });

    return processedImages;
  }

  fillSearchDict = (pipeline, keywords, images) => {
    const imageList = this.processSearchResult(images);
    const copiedSearchDict = Object.assign({}, this.state.searchDict);
    copiedSearchDict[pipeline][keywords] = imageList;
    this.setState(prevState => ({
      searchDict: copiedSearchDict,
      searchDictInsertions: prevState.searchDictInsertions + 1,
    }));
  }

  countSearchDictInsertions = () => {
    this.setState(prevState => ({
      searchDictInsertions: prevState.searchDictInsertions + 1,
    }));
  }

  combineFiles = () => {

  };

  render() {
    return (
      <div>
        hi
      </div>
    );
  }
}

export default EvaluationAnalysis;
