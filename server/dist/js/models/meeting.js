"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const meetingSchema = new mongoose_1.Schema({
    meetingLen: {
        type: Number,
        default: 69,
    }
});
exports.default = mongoose_1.model('meeting', meetingSchema);
