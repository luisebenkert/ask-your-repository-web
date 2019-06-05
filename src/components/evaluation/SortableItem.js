// @flow
import React, { Component } from 'react';
import { SortableElement } from 'react-sortable-hoc';
import './Evaluation.scss';

class SortableItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
    };
  }

  disableImage() {
    this.setState({
      disabled: true,
    });
  }

  render() {
    const { value } = this.props;
    const { disabled } = this.state;

    return (
      SortableElement(() => (
        <div
          className="clickable"
          onClick={this.disableImage}
        >
          <img
            className={'Gallery__item' + (disabled ? 'Gallery__item__disabled' : '' )}
            src={value.url}
            alt={value.id}
          />
        </div>
      ))      
    );
  }
}

export default SortableItem;
