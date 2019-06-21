import React, { Component } from 'react';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import EvaluationService from '../../services/EvaluationService';
import loading from '../../assets/loading.gif';
import Graph from './Graph';
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
      filesList: [],
      filesRead: 0,
      searchDict: {},
      priorityList: {},
      createdSearchDict: false,
      createdPriorityList: false,
      ndcgList: {},
      finishedCalculations: false,
    };
  }

  async componentDidMount() {
    this.readFiles();
    this.searchDatabase();
  }

  componentDidUpdate() {
    const { createdPriorityList, createdSearchDict, finishedCalculations } = this.state;
    if (createdPriorityList && createdSearchDict && !finishedCalculations) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log(this.state.searchDict);
      console.log(this.state.priorityList);
      this.calculateNDCG();
    }
  }

  readFiles = () => {
    for (let i = 0; i < this.state.files.length; i += 1) {
      this.setupReader(this.state.files[i]);
    }
  };

  setupReader = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const object = JSON.parse(e.target.result);
      this.setState(prevState => ({
        filesList: [...prevState.filesList, object],
      }));
    };
    reader.onloadend = () => {
      this.setState(prevState => ({
        filesRead: prevState.filesRead + 1,
      }), () => {
        if (this.state.filesRead >= this.state.files.length) {
          this.combineSets();
        }
      });
    };
    reader.readAsText(file);
  };

  calculateKappa = (searchterm, imageId) => {
    const { filesList } = this.state;
    let sum = 0;

    filesList.forEach((file) => {
      sum += file[searchterm][imageId] - 1;
    });

    const kappa = sum / filesList.length;
    return kappa;
  }

  combineSets = () => {
    const { filesList, searchterms } = this.state;
    const priorityList = {};

    searchterms.forEach((searchterm) => {
      const stringName = searchterm.join(',');
      priorityList[stringName] = {};
      Object.keys(filesList[0][searchterm]).forEach((imageId) => {
        const kappa = this.calculateKappa(searchterm, imageId);
        priorityList[stringName][imageId] = kappa;
      });
    });

    this.setState({
      priorityList,
      createdPriorityList: true,
    });
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

  callback = (searchDict) => {
    console.log('-----------------------');
    console.log('All done');
    console.log(searchDict);
    this.setState({
      searchDict,
      createdSearchDict: true,
    });
  }

  searchByKeywords = async (keywords, pipeline) => {
    const { teamId } = this.state;
    const search = keywords.join(' ');
    const searchResult = await EvaluationService.get({
      search,
      teamId,
      limit: 1000,
      offset: 0,
      pipeline: pipeline + 1,
    });

    //const filteredImages = searchResult.images.filter(image => image.score === undefined || image.score > 0);
    const imageList = this.processSearchResult(searchResult.images);

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

  getSubLists = (searchRanking) => {
    const element = searchRanking.find((val) => {
      return val[1] === 0;
    });

    const index = searchRanking.indexOf(element);

    const found = searchRanking.slice(0, index);
    const missing = searchRanking.slice(index, searchRanking.length);
    return [found, missing];
  }

  getFoundDCG = (found, searchterm) => {
    const { priorityList } = this.state;
    let foundDCG = 0;
    found.forEach((image, index) => {
      const imageId = image[0];
      const position = index + 1;
      const priority = priorityList[searchterm][imageId];
      foundDCG += priority / Math.log2(position + 1);
    });
    return foundDCG;
  };

  getMissingDCG = (missing, searchterm) => {
    const { priorityList } = this.state;
    let missingDCG = 0;

    missing.forEach((image) => {
      const imageId = image[0];
      const priority = priorityList[searchterm][imageId];
      image.push(priority);
    });
    missing.sort((first, second) => second[2] - first[2]);

    missing.forEach((image, index) => {
      const imageId = image[0];
      const position = index + 1;
      const priority = priorityList[searchterm][imageId];
      missingDCG += priority / Math.log2(position + 1);
    });
    return missingDCG;
  }

  calculateDCG = (searchRanking, searchterm) => {
    const sublists = this.getSubLists(searchRanking);
    const found = sublists[0];
    const missing = sublists[1];

    const foundDCG = this.getFoundDCG(found, searchterm);
    const missingDCG = this.getMissingDCG(missing, searchterm);

    const dcg = foundDCG - missingDCG;

    return dcg;
  }

  calculateIDCG = (searchRanking, searchterm) => {
    const { priorityList } = this.state;
    let idcg = 0;

    searchRanking.forEach((image) => {
      const imageId = image[0];
      const priority = priorityList[searchterm][imageId];
      image.push(priority);
    });

    searchRanking.sort((first, second) => second[2] - first[2]);

    searchRanking.forEach((image, index) => {
      const position = index + 1;
      const priority = image[2];

      idcg += priority / Math.log2(position + 1);
    });

    return idcg;
  }

  calculateNDCG = () => {
    const { searchDict } = this.state;
    const ndcgList = {};

    Object.keys(searchDict).forEach((pipeline) => {
      const searchtermList = searchDict[pipeline];
      ndcgList[pipeline] = {};
      Object.keys(searchtermList).forEach((searchterm) => {
        const imageList = searchtermList[searchterm];
        /* if (Object.keys(imageList).length < 1) {
          ndcgList[pipeline][searchterm] = 0;
        } */
        const searchRanking = [];
        Object.keys(imageList).forEach((imageId) => {
          searchRanking.push([imageId, imageList[imageId]]);
        });
        searchRanking.sort((first, second) => second[1] - first[1]);
        const dcg = this.calculateDCG(searchRanking, searchterm);
        const idcg = this.calculateIDCG(searchRanking, searchterm);
        const ndcg = dcg / idcg;
        const normalized = (ndcg + 1) / 2;
        ndcgList[pipeline][searchterm] = normalized;
      });
    });
    this.setState({
      ndcgList,
      finishedCalculations: true,
    });
  }

  render() {
    const { finishedCalculations, ndcgList, searchterms } = this.state;
    return (
      <div className="EvaluationAnalysis">
        {(!finishedCalculations) && (
          <img src={loading} className="EvaluationAnalysis__loading" alt="loading..." />
        )}
        {finishedCalculations && (
          <div className="EvaluationAnalysis__graph">
            <Graph
              data={ndcgList}
              xaxisLabels={searchterms}
            />
          </div>
        )}
      </div>
    );
  }
}

export default EvaluationAnalysis;
