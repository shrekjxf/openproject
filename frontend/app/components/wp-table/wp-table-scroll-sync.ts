// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {IAugmentedJQuery} from "angular";

const selectorTableSide = ".work-packages-tabletimeline--table-side";
const selectorTimelineSide = ".work-packages-tabletimeline--timeline-side";
const jQueryScrollSyncEventNamespace = ".scroll-sync";
const workPackageTableRowHeight = 41;


function getXandYScrollDeltas(ev: WheelEvent): [number, number] {
  let x = ev.deltaX;
  let y = ev.deltaY;

  if (ev.shiftKey) {
    x = y;
    y = 0;
  }

  return [x, y];
}

function getPlattformAgnosticScrollAmount(deltaY: number) {
  return workPackageTableRowHeight;
}

function syncWheelEvent(jev: JQueryEventObject, elementTable: JQuery, elementTimeline: JQuery) {
  const ev: WheelEvent = jev.originalEvent as any;
  const [, deltaY] = getXandYScrollDeltas(ev);

  if (deltaY === 0) {
    return;
  }
  ev.preventDefault();

  const scrollAmout = getPlattformAgnosticScrollAmount(deltaY);
  const delta = deltaY > 0 ? scrollAmout : -scrollAmout;

  window.requestAnimationFrame(function () {
    elementTable[0].scrollTop = elementTable[0].scrollTop + delta;
    elementTimeline[0].scrollTop = elementTimeline[0].scrollTop + delta;
  });
}

/**
 * Activate or deactivate the scroll-sync between the table and timeline view.
 *
 * @param $element true if the timeline is visible, false otherwise.
 */
export function createScrollSync($element: IAugmentedJQuery) {

  var elTable = jQuery($element).find(selectorTableSide);
  var elTimeline = jQuery($element).find(selectorTimelineSide);

  return (timelineVisible: boolean) => {

    // state vars
    var syncedLeft = false;
    var syncedRight = false;

    if (timelineVisible) {
      // setup event listener for table
      elTable.on("wheel" + jQueryScrollSyncEventNamespace, (jev: JQueryEventObject) => {
        syncWheelEvent(jev, elTable, elTimeline);
      });
      elTable.on("scroll" + jQueryScrollSyncEventNamespace, (ev: JQueryEventObject) => {
        syncedLeft = true;
        if (!syncedRight) {
          elTimeline[0].scrollTop = ev.target.scrollTop;
        }
        if (syncedLeft && syncedRight) {
          syncedLeft = false;
          syncedRight = false;
        }
      });

      // setup event listener for timeline
      elTimeline.on("wheel" + jQueryScrollSyncEventNamespace, (jev: JQueryEventObject) => {
        syncWheelEvent(jev, elTable, elTimeline);
      });
      elTimeline.on("scroll" + jQueryScrollSyncEventNamespace, (ev: JQueryEventObject) => {
        syncedRight = true;
        if (!syncedLeft) {
          elTable[0].scrollTop = ev.target.scrollTop;
        }
        if (syncedLeft && syncedRight) {
          syncedLeft = false;
          syncedRight = false;
        }
      });
    } else {
      elTable.off(jQueryScrollSyncEventNamespace);
    }
  };

}
