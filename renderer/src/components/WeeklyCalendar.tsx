/*
Copyright (C) 2018 Bryan Hughes <bryan@nebri.us>

Contact Schedular is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Contact Schedular is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Contact Schedular.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as React from 'react';
import { ICalendar } from '../common/types';

export interface IStateProps {
  calendars: ICalendar[];
}

export type IDispatchProps = {} // No dispatch props (yet?)

export type IProps = IStateProps & IDispatchProps;

export function WeeklyCalendar(props: IProps): JSX.Element {
  return (
    <div className="weekly-calendar">
      Weekly Calendar
    </div>
  );
}