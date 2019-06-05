// @flow
import type { SetActiveTeamAction } from './active_team/activeTeam.actions';
import type { StartPresentationAction } from './presentation/presentation.actions';
import type { TurnOnPresentationModeAction, TurnOffPresentationModeAction } from './presentation_mode/presentationMode.actions';
import type { OpenTeamSidebarAction, CloseTeamSidebarAction } from './team_sidebar/teamSidebar.actions';

export type Action =
  | SetActiveTeamAction
  | StartPresentationAction
  | TurnOnPresentationModeAction
  | TurnOffPresentationModeAction
  | OpenTeamSidebarAction
  | CloseTeamSidebarAction;
