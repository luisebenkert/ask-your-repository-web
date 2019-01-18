// @flow

// This file is only for state related testing

import type { AppState } from './AppState';
import { initialState as presentation } from './presentation/presentation.reducer';
import { initialState as teamSidebar } from './team_sidebar/teamSidebar.reducer';
import { initialState as activeTeam } from './active_team/activeTeam.reducer';

const initialState: AppState = {
  flash: { messages: [] },
  presentation,
  activeTeam,
  teamSidebar,
};

export default initialState;
