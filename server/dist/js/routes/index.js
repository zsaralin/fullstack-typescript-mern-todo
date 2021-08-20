"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pres_1 = require("../controllers/pres");
const router = express_1.Router();
router.get('/get-pres-file', pres_1.getPresFile);
router.post('/add-pres', pres_1.addPres);
router.delete('/delete-pres/:id', pres_1.deletePres);
exports.default = router;
