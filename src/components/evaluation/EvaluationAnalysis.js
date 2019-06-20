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
    };
  }

  async componentDidMount() {
    // this.combineFiles();
    this.searchDatabase();
  }

  componentDidUpdate() {
    console.log(this.state.searchDict);
    console.log(this.state.searchDictInsertions);
  }

  searchDatabase = async () => {
    const { pipelines, searchterms } = this.state;
    const pipelinesMax = pipelines - 1;
    const searchtermsMax = searchterms.length;
    const searchDictLocal = {};
    let numUpdates = 0;
    const maxNumUpdates = pipelines * searchterms.length;

    let pipelineCounter = -1;
    let searchtermsCounter = 11;

    this.loop(searchDictLocal, searchterms, pipelinesMax, pipelineCounter, searchtermsMax, searchtermsCounter, numUpdates, maxNumUpdates);
  }

  loop = (searchDictLocal, searchterms, pipelinesMax, pipelineCounter, searchtermsMax, searchtermsCounter, numUpdates, maxNumUpdates) => {
    console.log('--------------------------');
    if (searchtermsCounter >= searchtermsMax) {
      searchtermsCounter = 0;
      pipelineCounter += 1;
      searchDictLocal[pipelineCounter] = {};
      console.log(searchDictLocal);
      console.log('///// NEW PIPELINE');
    }

    console.log(`numUpdates: ${numUpdates}`);
    console.log(`pipelineCounter: ${pipelineCounter}`);
    console.log(`searchtermsCounter: ${searchtermsCounter}`);

    const element = searchterms[searchtermsCounter];
    console.log(element);
    const nameString = element.join(',');
    console.log(nameString);
    this.searchByKeywords(element, pipelineCounter)
      .then((images) => {
        console.log('images:');
        console.log(images);
        searchDictLocal[pipelineCounter][nameString] = images;
        console.log('>>>>> updated dict');
        console.log(searchDictLocal);
        numUpdates += 1;
        searchtermsCounter += 1;
        if (numUpdates >= maxNumUpdates) {
          this.callback(searchDictLocal);
        } else {
          this.loop(searchDictLocal, searchterms, pipelinesMax, pipelineCounter, searchtermsMax, searchtermsCounter, numUpdates, maxNumUpdates);
        }
      });
  }

  callback = (searchDictLocal) => {
    console.log('-----------------------');
    console.log('All done');
    console.log(searchDictLocal);
  }

  searchByKeywords = async (keywords, pipeline) => {
    const { teamId } = this.state;
    const search = keywords.join(' ');
    const searchResult = await EvaluationService.get({
      search,
      teamId,
      limit: 1000,
      offset: 0,
      pipeline,
    });

    const filteredImages = searchResult.images.filter(image => image.score === undefined || image.score > 0);
    const imageList = this.processSearchResult(filteredImages);

    return imageList;
  };

  processSearchResult = (images) => {
    const processedImages = {};

    images.forEach((imageElement) => {
      const { id, score } = imageElement;
      processedImages[id] = score;
    });

    return processedImages;
  }

  render() {
    return (
      <div>
        hi
      </div>
    );
  }
}

export default EvaluationAnalysis;
