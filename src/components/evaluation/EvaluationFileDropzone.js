// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FileDropzone from '../upload/FileDropzone';
import './Evaluation.scss';

class EvaluationFileDropzone extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstUpload: true,
      files: [],
      testSet: props.testSet,
    };
  }

  handleDrop = (additions) => {
    const { files } = this.state;
    const images = [...files, ...additions];
    const diff = Array.from(new Set(images.map(a => a.name)))
      .map(name => images.find(a => a.name === name));

    this.setState({
      files: diff,
      firstUpload: false,
    });
  };

  render() {
    const { firstUpload, files, testSet } = this.state;

    return (
      <div className="EvaluationFileDropzone">
        {firstUpload
          ? (
            <FileDropzone onDrop={this.handleDrop} />
          )
          : (
            <div className="EvaluationFileDropzone__files">
              {files.map(file => (
                <div
                  className="EvaluationFileDropzone__files__item"
                  key={file.name}
                >
                  {file.name}
                </div>
              ))}
              <div className="EvaluationFileDropzone__files__addition">
                <FileDropzone onDrop={this.handleDrop} />
                <Link
                  to={{
                    pathname: '/evaluation/analysis',
                    state: {
                      files,
                      testSet,
                    },
                  }}
                  className="EvaluationFileDropzone__files__addition__submit"
                >
                  ✓
                </Link>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default EvaluationFileDropzone;
