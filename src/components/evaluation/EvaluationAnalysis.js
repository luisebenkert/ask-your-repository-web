// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import EvaluationService from '../../services/EvaluationService';
import loading from '../../assets/loading.gif';
import './Evaluation.scss';

class EvaluationAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: props.location.state.files,
      allFiles: [],
      filesRead: 0,
      combinedFiles: {},
      finishedInput: false,
      testSet: props.location.state.testSet,
      searches: {},
      finishedSearch: false,
    };
  }

  componentDidMount() {
    this.readFiles();
  }

  componentDidUpdate() {
    const { finishedInput, finishedSearch, combinedFiles } = this.state;
    if (Object.keys(combinedFiles).length !== 0 && !finishedInput) {
      this.getGoldenSet();
    }

    if (finishedSearch && finishedInput) {
      const result = this.calculateNDCG();
      console.log(result);
    }
  }

  getRanking = () => {
    const { searches } = this.state;
    const ranking = Object.assign({}, searches);

    Object.keys(searches).forEach((item) => {
      const sorted = Object.keys(searches[item]).sort((a, b) => -(searches[item][a] - searches[item][b]));
      ranking[item] = sorted;
    });

    return ranking;
  };

  calculateDCG = (ranking, combinedFiles = []) => {
    let index = 1;
    let sum = 0;

    ranking.forEach((id) => {
      const prio = combinedFiles[id] || 3;
      const div = Math.log(index + 1);
      const val = prio / div;
      sum += val;
      index += 1;
    });

    return sum;
  }

  calculateNDCG = () => {
    const result = {};
    const ranking = this.getRanking();
    const { combinedFiles } = this.state;
    const idcg = this.calculateDCG(ranking[Object.keys(ranking)[0]]);

    Object.keys(ranking).forEach((item) => {
      const dcg = this.calculateDCG(ranking[item], combinedFiles[item]);
      const ndcg = dcg / idcg;

      result[item] = ndcg;
    });

    return result;
  };

  makeSearch = async (searchterms) => {
    const team = this.state.testSet.team_id;
    const len = searchterms.length;
    let index = 0;

    while (index < len) {
      await this.search(searchterms[index], team);
      index += 1;
    }

    this.setState({
      finishedSearch: true,
    });
  };

  search = async (item, team) => {
    const search = item.split(',');
    const result = await EvaluationService.get({
      search,
      teamId: team,
      limit: 1000,
      offset: 0,
    });

    const collection = {};
    result.images.forEach((image) => {
      collection[image.id] = image.score;
    });

    this.setState(prevState => ({
      searches: {
        ...prevState.searches,
        [item]: collection,
      },
    }));
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
        allFiles: [...prevState.allFiles, object],
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

  combineSets = () => {
    const { allFiles } = this.state;
    const searchterms = [];
    let count = 0;

    allFiles.forEach((file) => {
      Object.keys(file).forEach((item) => {
        if (count <= Object.keys(file).length) {
          searchterms.push(item);
          count += 1;
        }
        if (count === Object.keys(file).length + 1) {
          this.makeSearch(searchterms);
          count += 1;
        }
        Object.keys(file[item]).forEach((image) => {
          this.setState((prevState) => {
            const counts = prevState.combinedFiles[item] && prevState.combinedFiles[item][image]
              ? prevState.combinedFiles[item][image]
              : [];
            counts.push(file[item][image]);

            return {
              combinedFiles: {
                ...prevState.combinedFiles,
                [item]: {
                  ...prevState.combinedFiles[item],
                  [image]: counts,
                },
              },
            };
          });
        });
      });
    });
  }

  calculateKappa = (count) => {
    let sum = 0;
    count.forEach((item) => {
      sum += item;
    });
    const avg = sum / count.length;
    return avg;
  };

  getGoldenSet = () => {
    const { combinedFiles } = this.state;
    const result = {};
    Object.assign(result, combinedFiles);

    Object.keys(result).forEach((searchterm) => {
      Object.keys(result[searchterm]).forEach((item) => {
        const count = result[searchterm][item];
        const average = this.calculateKappa(count);
        result[searchterm][item] = average;
      });
    });

    this.setState({
      combinedFiles: result,
      finishedInput: true,
    });
  }

  render() {
    const {
      combinedFiles,
      searches,
      finishedInput,
      finishedSearch,
    } = this.state;

    return (
      <div className="EvaluationAnalysis">
        {(!finishedInput || !finishedSearch) && (
          <img src={loading} className="EvaluationAnalysis__loading" alt="loading..." />
        )}
      </div>
    );
  }
}

export default connect()(EvaluationAnalysis);
