"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var db_1 = require("./db");
var moment = require("moment-timezone");
var electron_1 = require("electron");
var notificationWindow;
var DAY_IN_MS = 1000 * 60 * 60 * 24;
var MIN_MONTHLY_GAP = DAY_IN_MS * 25;
var MONTHLY_GAP_SCALING_FACTOR = 0.1 / DAY_IN_MS;
var MIN_QUARTERLY_GAP = DAY_IN_MS * 80;
var QUARTERLY_GAP_SCALING_FACTOR = 0.05 / DAY_IN_MS;
var MAX_WEEKLY_CONTACTS = 10;
var TICK_INTERVAL = 1000 * 60 * 15;
function refreshQueue(cb) {
    var queue = db_1.dataSource.getQueue();
    var lastUpdated = moment(queue.lastUpdated);
    if (lastUpdated.isAfter(moment().startOf('week'))) {
        setImmediate(cb);
        return;
    }
    var contacts = db_1.dataSource.getContacts();
    var weights = [];
    for (var _i = 0, contacts_1 = contacts; _i < contacts_1.length; _i++) {
        var contact = contacts_1[_i];
        var gap = Date.now() - contact.lastContacted;
        switch (contact.frequency) {
            case 'weekly':
                weights.push({
                    contact: contact,
                    weight: 1
                });
                break;
            case 'monthly':
                if (gap > MIN_MONTHLY_GAP) {
                    weights.push({
                        contact: contact,
                        weight: Math.min(1, MONTHLY_GAP_SCALING_FACTOR * (gap - MIN_MONTHLY_GAP))
                    });
                }
                break;
            case 'quarterly':
                if (gap > MIN_QUARTERLY_GAP) {
                    weights.push({
                        contact: contact,
                        weight: Math.min(1, QUARTERLY_GAP_SCALING_FACTOR * (gap - MIN_QUARTERLY_GAP))
                    });
                }
                break;
        }
    }
    // Shuffle the list using the Fisher-Yates algorithm:
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    var newContactQueue = weights
        .sort(function (a, b) { return b.weight - a.weight; })
        .slice(0, MAX_WEEKLY_CONTACTS)
        .map(function (weight) { return weight.contact; });
    for (var i = newContactQueue.length - 1; i > 0; i--) {
        var j = Math.round(Math.random() * i);
        var temp = newContactQueue[i];
        newContactQueue[i] = newContactQueue[j];
        newContactQueue[j] = temp;
    }
    console.log("Scheduling " + newContactQueue.length + " contacts out of " + weights.length + " possible contacts");
    db_1.setWeeklyQueue(newContactQueue, cb);
}
function init(cb) {
    var state = 'queued';
    function showNotification() {
        // const nextContact = dataSource.getQueue().contactQueue[0];
        notificationWindow = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            frame: false,
            alwaysOnTop: true
        });
        notificationWindow.on('closed', function () {
            notificationWindow = null;
        });
        notificationWindow.loadFile(path_1.join(__dirname, '..', 'renderer', 'notification.html'));
    }
    function tick() {
        switch (state) {
            case 'queued':
                showNotification();
                break;
            case 'snoozing':
                showNotification();
                break;
            case 'do-not-disturb':
                console.log('Skipping tick because in do not disturb mode');
                break;
        }
        setTimeout(tick, TICK_INTERVAL);
    }
    setTimeout(tick, 5000);
    db_1.dataSource.on('queueUpdated', function (queue) {
        // TODO
    });
    refreshQueue(cb);
}
exports.init = init;
//# sourceMappingURL=scheduler.js.map