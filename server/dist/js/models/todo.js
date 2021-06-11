"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const todoSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    initTime: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    overtime: {
        type: Number,
        required: true
    },
    extra: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
}, { timestamps: true });
exports.default = mongoose_1.model('Todo', todoSchema);
