// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setActiveTeam } from '../../state/active_team/activeTeam.actionCreators';
import EvaluationService from '../../services/EvaluationService';
import './Evaluation.scss';

class EvaluationAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: props.location.state.files,
      allFiles: [],
      filesRead: 0,
      combinedFiles: {},
      calculated: false,
      testSet: props.location.state.testSet,
      searches: {},
    };
  }

  componentDidMount() {
    this.readFiles();
  }

  componentDidUpdate() {
    if (Object.keys(this.state.combinedFiles).length !== 0 && !this.state.calculated) {
      this.getGoldenSet();
    }
  }

  makeSearch = async (searchterms) => {
    const team = this.state.testSet.team_id;
    const len = searchterms.length;
    let index = 0;

    while (index < len) {
      await this.search(searchterms[index], team);
      index += 1;
    }
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
      calculated: true,
    });
  }

  render() {
    const { combinedFiles, searches } = this.state;

    console.log(combinedFiles);
    console.log(searches);

    return (
      <div className="EvaluationAnalysis">
        
      </div>
    );
  }
}

export default connect()(EvaluationAnalysis);
