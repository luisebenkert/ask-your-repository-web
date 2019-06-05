// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import TeamnInitials from '../team/TeamInitials';
import { setActiveTeam } from '../../state/active_team/activeTeam.actionCreators';
import type { Team } from '../../models/Team';
import './TeamSelectItem.scss';

type Props = {
  team: Team,
  dispatch: Function,
};

class TeamSelectItem extends Component<Props> {
  handleClick = () => {
    const { dispatch, team } = this.props;
    dispatch(setActiveTeam(team));
  };

  renderMembersList() {
    const { members } = this.props.team;
    const selectionSize = 3;
    const hasMoreThanSelection = members.length > selectionSize;
    const selection = hasMoreThanSelection ? members.slice(0, selectionSize) : members;

    let text = selection.map(user => user.username).join(', ');
    if (hasMoreThanSelection) text += '...';

    return text;
  }

  render() {
    const { team } = this.props;

    return (
      <button
        type="button"
        className="TeamSelectItem"
        onClick={this.handleClick}
      >
        <TeamnInitials team={team} className="TeamSelectItem__avatar" />
        <div className="TeamSelectItem__info">
          <div className="TeamSelectItem__title">
            {team.name}
          </div>
          <div className="TeamSelectItem__members">
            {this.renderMembersList()}
          </div>
        </div>
      </button>
    );
  }
}

export default connect()(TeamSelectItem);
